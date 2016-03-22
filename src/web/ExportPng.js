
function exportPNG(model) {
    console.log("got the model",model);
    var canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    var c = canvas.getContext('2d');

    c.fillStyle = 'red';
    for(var i=0;i<16; i++) {
        for(var j=0; j<16; j++) {
            var px = model.getPixel(i,j);
            c.fillStyle = model.lookupCanvasColor(px);
            c.fillRect(i,j,1,1);
        }
    }
    //c.fillRect(0,0,8,8);
    //c.fillRect(8,8,8,8);
    var data = canvas.toDataURL("image/png");
    console.log('data is',data);
    location.href=data;
}

export default exportPNG;