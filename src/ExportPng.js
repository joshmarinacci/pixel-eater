
function drawLayer(c,layer, model) {
    if(!layer.visible) return;
    c.save();
    c.globalAlpha = layer.opacity;
    let sc = 1;//this.state.scale;
    for(let y=0; y<16; y++) {
        for (let x = 0; x < 16; x++) {
            var val = model.getPixelFromLayer(x,y,layer);
            if(val == -1) continue;
            c.fillStyle = model.lookupCanvasColor(val);
            c.fillRect(x * sc, y * sc, sc, sc);
        }
    }
    c.restore();
}
function exportPNG(model) {
    console.log("got the model",model);
    var canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    var c = canvas.getContext('2d');

    model.getReverseLayers().map((layer) => drawLayer(c, layer, model));
    var data = canvas.toDataURL("image/png");
    window.open(data);
}

export default exportPNG;