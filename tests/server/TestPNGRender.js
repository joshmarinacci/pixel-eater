/**
 * Created by josh on 4/5/16.
 */

var fs = require('fs');
var path = require('path');
var PngRender = require('../../src/server/PngRenderer');
var PI = require('pureimage');


var filename = path.join(__dirname,"test_doc_1.json");
if(fs.existsSync(filename)) {
    var model = JSON.parse(fs.readFileSync(filename).toString()).model;
    var img = PngRender.renderBitmap(model);
    PI.encodePNG(img, fs.createWriteStream('out.png'), function(err) {
        console.log("wrote out the png file to out.png with error",err);
    });
} else {
    console.log("missing! file");
    return;
}
