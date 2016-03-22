
function exportPNG(model) {
    var canvas = document.createElement("canvas");
    canvas.width = 16;
    canvas.height = 16;
    var c = canvas.getContext('2d');

    c.fillStyle = 'red';
    c.fillRect(0,0,8,8);
    c.fillRect(8,8,8,8);
    var data = canvas.toDataURL("image/png");
    console.log('data is',data);
    location.href="data:image/png;base64,"+data;
}

export default exportPNG;