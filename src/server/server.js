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

//create database if necessary
function startDatabase(cb) {
    RethinkDB.connect({host:'localhost', db:'pixel-eater'}, function(err,c) {

    });
}

//start webserver
function startWebserver(cb) {
    app.listen(PORT, function() {
        console.log("ready to serve on http://localhost:"+PORT+"/");
        if(cb) cb();
    });
}


startWebserver(function(){
    console.log("we are rolling");
});


