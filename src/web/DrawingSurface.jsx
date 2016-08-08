
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
            width:props.model.getWidth(),
            height:props.model.getHeight()
        };

        var self = this;
        this.props.model.changed(function() {
            self.drawCanvas();
        });

    }


    drawCanvas() {
        let c = this.refs.canvas.getContext('2d');

        this.drawBackground(c);
        this.props.model.getReverseLayers().map((layer) => this.drawLayer(c, layer));
        if(this.props.drawGrid === true) this.drawGrid(c);
    }

    drawBackground(c) {
        var sc = this.props.scale;
        var width = this.props.model.getWidth() * sc;
        var height = this.props.model.getHeight() * sc;
        var bg = this.props.model.getBackgroundColor();
        c.fillStyle = this.props.model.lookupCanvasColor(bg);
        c.fillRect(this.state.xoff, this.state.yoff, width, height);
    }

    drawLayer(c, layer) {
        if(!layer.visible) return;
        c.save();
        c.globalAlpha = layer.opacity;
        let sc = this.props.scale;
        var model = this.props.model;
        for(let y=0; y<model.getHeight(); y++) {
            for (let x = 0; x < model.getWidth(); x++) {
                var val = model.getPixelFromLayer(x,y,layer);
                if(val == -1) continue;
                c.fillStyle = model.lookupCanvasColor(val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }
        c.restore();
    }

    drawGrid(c) {
        c.strokeStyle = 'black';
        var sc = this.props.scale;
        var width = this.props.model.getWidth() * sc;
        var height = this.props.model.getHeight() * sc;
        c.save();
        c.translate(0.5+this.state.xoff,0.5+this.state.yoff);
        c.beginPath();
        for (let i = 0; i <= this.props.model.getHeight(); i++) {
            c.moveTo(0, i * sc);
            c.lineTo(width, i * sc);
        }
        for (let i = 0; i <= this.props.model.getWidth(); i++) {
            c.moveTo(i * sc, 0);
            c.lineTo(i * sc, height);
        }
        c.stroke();
        c.restore();
    }

    componentDidMount() {
        this.drawCanvas();
    }

    componentWillReceiveProps(props) {
        this.setState({
            width:props.model.getWidth(),
            height:props.model.getHeight()
        });
        setTimeout(this.drawCanvas.bind(this),0);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.scale != nextProps.scale) return true;
        if(this.props.model !== nextProps.model) return true;
        if(this.state.width != nextProps.model.getWidth()) return true;
        if(this.state.height != nextProps.model.getHeight()) return true;
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
            Math.floor((mousePoint.x-this.state.xoff)/this.props.scale),
            Math.floor((mousePoint.y-this.state.yoff)/this.props.scale));
    }

    mouseUp() {
        this.setState({down:false});
        this.props.tool.mouseUp(this);
    }

    keyDown(e) {
        if(this.props.tool.keyDown) {
            var ret = this.props.tool.keyDown(e);
            if(ret === true) return;
        }
        this.props.onKeyDown(e);
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
            <canvas ref="canvas"
                    tabIndex="1"
                    width={this.props.model.getWidth()*this.props.scale+1}
                    height={this.props.model.getHeight()*this.props.scale+1}
                    onMouseUp={this.mouseUp.bind(this)}
                    onMouseDown={this.mouseDown.bind(this)}
                    onMouseMove={this.mouseMove.bind(this)}
                    onContextMenu={this.contextMenu.bind(this)}
                    onKeyDown={this.keyDown.bind(this)}
            />
        </div>
    }
}
