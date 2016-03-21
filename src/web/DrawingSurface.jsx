
import React from "react";

class Point {
    static makePoint(x,y) {
        return {
            x:x,
            y:y
        }
    }
}
export default class DrawingSurface extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            down:false,
            xoff:5,
            yoff:5,

            scale:25,
            data:[],
            pw:16,
            ph:16
        }

        this.fillData(this.state.data,this.state.pw*this.state.ph,0);
        this.state.data[2] = 1;
        this.state.data[122] = 1;

    }
    fillData(array, len, val) {
        for(let i=0; i<len; i++) {
            array[i] = val;
        }
    }

    setData(point, val) {
        var n = point.x + point.y*16;
        this.state.data[n] = val;
    }

    lookupColor(val) {
        if(val == 1) return 'green';
        return 'blue';
    }

    drawCanvas() {


        var width = this.state.pw*this.state.scale;
        var height = this.state.ph*this.state.scale;
        var canvas = this.refs.canvas;
        var c = canvas.getContext('2d');
        c.fillStyle = 'red';
        c.fillRect(0 + this.state.xoff,0 + this.state.yoff,width,height);

        c.strokeStyle = 'black';
        c.save();
        c.translate(0.5+this.state.xoff,0.5+this.state.yoff);

        for(let y=0; y<16; y++) {
            for (let x = 0; x < 16; x++) {
                var val = this.state.data[x+y*16];
                c.fillStyle = this.lookupColor(val);
                c.fillRect(x * this.state.scale, y * this.state.scale, this.state.scale, this.state.scale);
            }
        }

        c.beginPath();
        for(let i=0; i<=this.state.ph; i++) {
            c.moveTo(0,     i*this.state.scale);
            c.lineTo(width, i*this.state.scale);
        }
        for(let i=0; i<=this.state.pw; i++) {
            c.moveTo(i*this.state.scale, 0);
            c.lineTo(i*this.state.scale, height);
        }
        c.stroke();
        c.restore();
    }

    componentDidMount() {
        this.drawCanvas();
    }

    shouldComponentUpdate() {
        return false;
    }

    mouseDown() {
        this.setState({down:true})
    }

    mouseMove(e) {
        if(this.state.down) {
            var rect = this.refs.canvas.getBoundingClientRect();
            var modelPoint = this.mouseToModel(Point.makePoint(e.clientX-rect.left, e.clientY-rect.top));
            this.setData(modelPoint,1);
            this.drawCanvas();
        }
    }

    mouseToModel(mousePoint) {
        return Point.makePoint(
            Math.floor((mousePoint.x-this.state.xoff)/this.state.scale),
            Math.floor((mousePoint.y-this.state.yoff)/this.state.scale));
    }

    mouseUp() {
        this.setState({down:false})
    }

    render() {
        return <div className="grow">
            <canvas ref="canvas" width="800" height="800"
                    onMouseUp={this.mouseUp.bind(this)}
                    onMouseDown={this.mouseDown.bind(this)}
                    onMouseMove={this.mouseMove.bind(this)}></canvas>
        </div>
    }
}
