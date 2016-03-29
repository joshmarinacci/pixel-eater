/**
 * Created by josh on 3/27/16.
 */

var PORT = 30065;
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
    web: {
        produces: ['application/json'],
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

function summarizeList(cursor, list, cb) {
    cursor.next().then(function(val) {
        RethinkDB.table('items').filter(RethinkDB.row('list').eq(val.id)).count().run(conn, function(err, count) {
            val.count = count;
            list.push(val);
            summarizeList(cursor,list,cb);
        });
    }).catch(function(){
        cb(list);
    })
}

app.get('/docs',stormpath.loginRequired,function(req,res) {
    RethinkDB.table('docs').run(conn).then(function(cursor) {
        summarizeList(cursor, [], function(list){
            res.json(list);
        });
    });
});
app.get('/whoami',stormpath.loginRequired,function(req,res) {
    console.log("whoami = ", req.user);
    res.json({status:'success',user:req.user});
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

