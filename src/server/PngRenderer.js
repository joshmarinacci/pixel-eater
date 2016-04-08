/**
 * Created by josh on 4/5/16.
 */
var PI = require('pureimage');

function lookupColor(model,val) {
    return model.palette[val];
}

function drawLayer(c,layer, model, scale) {
    for(var j=0; j<16; j++) {
        for(var i=0; i<16; i++) {
            var index = j*16+i;
            var val = layer.data[index];
            if(val < 0) continue;
            c.fillStyle = lookupColor(model, val);
            fillRect(c,i*scale,j*scale,scale,scale);
        }
    }
}

function fillRect(c,x,y,w,h) {
    for(var j=0; j<w; j++) {
        for(var i=0; i<h; i++) {
            c.setPixeli32(i+x,j+y,c._fillColor);
        }
    }
}

module.exports = {
    renderBitmap(model,scale) {
        var img = PI.make(16*scale,16*scale);

        var c = img.getContext('2d');
        //c.clearRect(0,0,16*scale,16*scale);
        c.fillStyle = "#000000";
        c.fillRect(0,0,16*scale,16*scale);
        model.layers.map((layer) => drawLayer(c,layer, model, scale));
        return img;
    }
}