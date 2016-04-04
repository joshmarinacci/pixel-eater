
import React from "react";
import BitmapModel from "./BitmapModel";

class Point {
    static makePoint(x,y) {
        return {
            x:x,
            y:y,
            equals: function(pt) {
                if(!pt) return false;
                if(pt.x == this.x && pt.y == this.y) return true;
                return false;
            }
        }
    }
}

export default class DrawingSurface extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            down:false,
            xoff:0,
            yoff:0,
            scale:25
        };

        var self = this;
        this.props.model.changed(function() {
            self.drawCanvas();
        });

    }

    drawCanvas() {
        var sc = this.state.scale;
        var width = this.props.model.getWidth() * sc;
        var height = this.props.model.getHeight() * sc;
        var canvas = this.refs.canvas;
        var c = canvas.getContext('2d');
        c.fillStyle = 'red';
        c.fillRect(0 + this.state.xoff,0 + this.state.yoff,width,height);

        c.strokeStyle = 'black';
        c.save();

        for(let y=0; y<16; y++) {
            for (let x = 0; x < 16; x++) {
                var val = this.props.model.getPixel(x,y);
                c.fillStyle = this.props.model.lookupCanvasColor(val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }

        if(this.props.drawGrid === true) {
            c.translate(0.5+this.state.xoff,0.5+this.state.yoff);
            c.beginPath();
            for (let i = 0; i <= this.props.model.getWidth(); i++) {
                c.moveTo(0, i * sc);
                c.lineTo(width, i * sc);
            }
            for (let i = 0; i <= this.props.model.getWidth(); i++) {
                c.moveTo(i * sc, 0);
                c.lineTo(i * sc, height);
            }
            c.stroke();
        }
        c.restore();
    }

    componentDidMount() {
        this.drawCanvas();
    }

    componentWillReceiveProps(props) {
        setTimeout(this.drawCanvas.bind(this),0);
    }

    shouldComponentUpdate() {
        return false;
    }

    getModelPoint(e) {
        var rect = this.refs.canvas.getBoundingClientRect();
        return this.mouseToModel(Point.makePoint(e.clientX-rect.left, e.clientY-rect.top));
    }

    mouseDown(e) {
        if(e.button != 0) return;
        if(e.ctrlKey) return;
        var modelPoint = this.getModelPoint(e);
        this.setState({down:true, prevPoint:modelPoint});
        this.props.tool.mouseDown(this,modelPoint);
    }

    mouseMove(e) {
        e.stopPropagation();
        if(!this.state.down) return;
        var modelPoint = this.getModelPoint(e);
        if(!modelPoint.equals(this.state.prevPoint)) {
            this.props.tool.mouseDrag(this,modelPoint);
            this.setState({prevPoint:modelPoint});
        }
    }

    mouseToModel(mousePoint) {
        return Point.makePoint(
            Math.floor((mousePoint.x-this.state.xoff)/this.state.scale),
            Math.floor((mousePoint.y-this.state.yoff)/this.state.scale));
    }

    mouseUp() {
        this.setState({down:false});
        this.props.tool.mouseUp(this);
    }

    contextMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        if(this.props.tool.contextMenu) {
            this.props.tool.contextMenu(this,this.getModelPoint(e));
        }
    }

    render() {
        return <div className="grow scroll">
            <canvas ref="canvas" width={16*25+1} height={16*25+1}
                    onMouseUp={this.mouseUp.bind(this)}
                    onMouseDown={this.mouseDown.bind(this)}
                    onMouseMove={this.mouseMove.bind(this)}
                    onContextMenu={this.contextMenu.bind(this)}
            />
        </div>
    }
}
