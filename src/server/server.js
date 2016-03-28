/**
 * Created by josh on 3/27/16.
 */

var PORT = 30065;
var RethinkDB = require('rethinkdb');
var express = require('express');
var cors = require('cors');
var bodyParser = require('body-parser');

//create an app
var app = express();

//make all JSON endpoints be rendered pretty
app.set("json spaces",4);

//turn on cross origin resource support
app.use(cors({origin:true, credentials:true}));

//assume all bodies will be JSON and parse them automatically
app.use(bodyParser.json());

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

startDatabase(function() {
    startWebserver(function() {
        console.log('ready to go');
    });
});

