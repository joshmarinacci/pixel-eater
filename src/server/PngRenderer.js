/**
 * Created by josh on 4/5/16.
 */
var PI = require('pureimage');

function lookupColor(model,val) {
    return model.palette[val];
}

function drawLayer(c,layer, model) {
    for(var j=0; j<16; j++) {
        for(var i=0; i<16; i++) {
            var index = j*16+i;
            var val = layer.data[index];
            if(val < 0) continue;
            c.fillStyle = lookupColor(model, val);
            c.setPixeli32(i,j,c._fillColor);
        }
    }
}

module.exports = {
    renderBitmap(model) {
        var img = PI.make(16,16);

        var c = img.getContext('2d');
        c.clearRect(0,0,16,16);
        c.fillStyle = "#000000";
        c.fillRect(0,0,16,16);
        model.layers.map((layer) => drawLayer(c,layer, model));
        return img;
    }
}