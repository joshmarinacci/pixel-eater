/**
 * Created by josh on 3/27/16.
 */

var PORT = 30075;
var RethinkDB = require('rethinkdb');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');
var fs = require('fs');
var PngRender = require("./PngRenderer");
var PI = require('pureimage');


//create an app
var app = express();

//make all JSON endpoints be rendered pretty
app.set("json spaces",4);

//turn on cross origin resource support
app.use(cors({origin:true, credentials:true}));

//assume all bodies will be JSON and parse them automatically
app.use(bodyParser.json());

if(fs.existsSync("config.json")) {
    var cfg = JSON.parse(fs.readFileSync("config.json").toString());
    console.log("not currently using config");
}

//database connection
var conn = null;
function startDatabase(cb) {
    RethinkDB.connect({host: 'localhost'}).then(function (c) {
        console.log("here");
        conn = c;
        conn.use('pixel_eater');
        RethinkDB.dbList().run(conn).then(function (arr) {
                //create DB if necessary
                if (arr.indexOf("pixel_eater") < 0) {
                    return RethinkDB.dbCreate("pixel_eater").run(conn);
                }
            })
            // select the docs table
            .then(function () {
                conn.use('pixel_eater');
                return RethinkDB.table('docs').run(conn);
            })
            //create the docs table if necessary
            .catch(function () {
                return RethinkDB.tableCreate("docs").run(conn);
            })
            .then(function () {
                return RethinkDB.table("docs").run(conn);
            })
            .then(function (data) {
                if (cb)cb();
            });
    }).catch(function (err) {
        console.log(err);
        console.log("couldn't connect to the database");
    });
}



//start webserver
function startWebserver(cb) {
    app.listen(PORT, function() {
        console.log("ready to serve on http://localhost:"+PORT+"/");
        if(cb) cb();
    });
}

function loginRequired(req,res,next) {
    console.log("pretending logged in");
    if(!req.user) {
        console.log("not logged in");
        return res.json({status:'error',message:'user not logged in'});
    }
    next();
}

app.post('/login',function(req,res) {
    console.log("request to do a login", req.body);
});
app.post('/register',function(req,res) {
    console.log("request to do a register", req.body);
});
app.get('/listfull',loginRequired,function(req,res) {
    RethinkDB.table('docs').filter(RethinkDB.row("username").eq(req.user.username)).run(conn)
        .then(function(cursor) {
            return cursor.toArray()
        })
        .then(function(list) {
            res.json(list);
        });
});
app.get('/whoami',loginRequired,function(req,res) {
    console.log("whoami = ", req.user);
    res.json({status:'success',user:req.user});
});

app.post("/save", loginRequired, function(req,res) {
    if(req.body.id) {
        RethinkDB.table('docs').get(req.body.id).update(req.body).run(conn)
            .then(function (ans) {
                res.json({status:'success',id:req.body.id})
            })
            .catch(function (err) {
                console.log("failed to save", err);
            });
    } else {
        delete req.body.id;
        req.body.username = req.user.username;
        RethinkDB.table('docs').insert([req.body]).run(conn)
            .then(function (ans) {
                var listid = ans.generated_keys[0];
                res.json({status: 'success', id: listid});
            })
            .catch((err) => console.log("error",err));
    }
});

app.post("/load", loginRequired, function(req,res) {
    RethinkDB.table('docs').get(req.body.id).run(conn)
        .then(function(doc) {
            res.json({status:'success',doc:doc});
        })
        .catch(function(err){
            console.log("there was an error while loading doc",req.body.id,err);
        })
});

app.post("/delete", loginRequired, function(req,res) {
    if(!req.body.id) {
        res.json({status:'error', message:"missing id parameter", id:req.body.id});
        return;
    }
    RethinkDB.table('docs').get(req.body.id).delete().run(conn)
        .then(function(ans) {
            console.log("ans = ", ans);
            res.json({status:'success', id:req.body.id})
        })
        .catch(function(err) {
            console.log("failed to delete",err);
            res.json({status:'error', message:"failure: " + err.toString(), id:req.body.id});
        });

});

app.get('/preview/:id',function(req,res) {
    RethinkDB.table('docs').get(req.params.id).run(conn)
        .then(function(doc,err) {
            if(doc == null) throw Error("doc not found");
            var scale = 1;
            if(req.query.scale) scale = parseInt(req.query.scale);
            var img = PngRender.renderBitmap(doc.model,scale);
            if(req.query.download == 'true') {
                res.attachment(doc.title + ".png");
            } else {
                res.type('png');
            }
            PI.encodePNG(img, res, function(err) {
                console.log('done rendering PNG');
            });
        })
        .catch(function(err) {
            console.log("there was an error while loading doc",req.params.id,err);
            res.json({status:'failure',message:err.toString()});
        })
});

startDatabase(function() {
    console.log("database is ready");
    startWebserver(function() {
        console.log('webserver is ready');
    });
});

