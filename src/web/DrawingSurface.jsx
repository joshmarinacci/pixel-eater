
import React from "react";

export default class DrawingSurface extends React.Component {
    fillData(array, len, val) {
        for(let i=0; i<len; i++) {
            array[i] = val;
        }
    }

    lookupColor(val) {
        if(val == 1) return 'green';
        return 'blue';
    }

    componentDidMount() {
        var pw = 16;
        var ph = 16;
        var xoff = 5;
        var yoff = 5;
        var scale = 25;


        var data = [];
        this.fillData(data,pw*ph,0);
        data[2] = 1;
        data[122] = 1;

        var width = pw*scale;
        var height = ph*scale;
        var canvas = this.refs.canvas;
        var c = canvas.getContext('2d');
        c.fillStyle = 'red';
        c.fillRect(0 + xoff,0 + xoff,width,height);

        c.strokeStyle = 'black';
        c.save();
        c.translate(0.5+xoff,0.5+yoff);

        for(let y=0; y<16; y++) {
            for (let x = 0; x < 16; x++) {
                var val = data[x+y*16];
                c.fillStyle = this.lookupColor(val);
                c.fillRect(x * scale, y * scale, scale, scale);
            }
        }

        c.beginPath();
        for(let i=0; i<=ph; i++) {
            c.moveTo(0,     i*scale);
            c.lineTo(width, i*scale);
        }
        for(let i=0; i<=pw; i++) {
            c.moveTo(i*scale, 0);
            c.lineTo(i*scale, height);
        }
        c.stroke();
        c.restore();

    }
    render() {
        return <div className="grow">
            <canvas ref="canvas" width="800" height="800"></canvas>
        </div>
    }
}
