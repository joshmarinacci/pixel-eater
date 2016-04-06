/**
 * Created by josh on 3/27/16.
 */

var PORT = 30075;
var RethinkDB = require('rethinkdb');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');


var stormpath = require('express-stormpath');

//create an app
var app = express();

//make all JSON endpoints be rendered pretty
app.set("json spaces",4);

//turn on cross origin resource support
app.use(cors({origin:true, credentials:true}));

//assume all bodies will be JSON and parse them automatically
app.use(bodyParser.json());


app.use(stormpath.init(app, {
    // Optional configuration options.
    application: {
        href: 'https://api.stormpath.com/v1/applications/YsU8xiLUaoZBupUPBld1x'
    },
    web: {
        produces: ['application/json'],
        register: {
            autoLogin: true,
            form: {
                fields: {
                    givenName: {
                        required: false
                    },
                    surname: {
                        required: false
                    }
                }
            }
        }
    }
}));


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

app.get('/listfull',stormpath.loginRequired,function(req,res) {
    RethinkDB.table('docs').filter(RethinkDB.row("username").eq(req.user.username)).run(conn)
        .then(function(cursor) {
            return cursor.toArray()
        })
        .then(function(list) {
            res.json(list);
        });
});
app.get('/whoami',stormpath.loginRequired,function(req,res) {
    console.log("whoami = ", req.user);
    res.json({status:'success',user:req.user});
});

app.post("/save", stormpath.loginRequired, function(req,res) {
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

app.post("/load", stormpath.loginRequired, function(req,res) {
    RethinkDB.table('docs').get(req.body.id).run(conn)
        .then(function(doc) {
            res.json({status:'success',doc:doc});
        })
        .catch(function(err){
            console.log("there was an error while loading doc",req.body.id,err);
        })
});

app.on('stormpath.ready', function () {
    console.log('Stormpath Ready!');
    startDatabase(function() {
        console.log("database is ready");
        startWebserver(function() {
            console.log('webserver is ready');
        });
    });
});

