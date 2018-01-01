import React, {Component} from "react";

class Point {
    static makePoint(x,y) {
        return {
            x:x,
            y:y,
            equals: function(pt) {
                if(!pt) return false;
                return pt.x === this.x && pt.y === this.y;
            }
        }
    }
}

export default class DrawingSurface extends Component {
    constructor(props) {
        super(props);
        this.state = {
            down: false,
            xoff: 0,
            yoff: 0,
            width: props.store.getTileWidth(props.model),
            height: props.store.getTileHeight(props.model),
            hoverEffect: null,
            hoverPoint: null
        };

        // this.props.model.changed(() => this.drawCanvas());
    }
    getWidth() {
        return this.props.store.getTileWidth(this.props.model)
    }
    getHeight() {
        return this.props.store.getTileHeight(this.props.model)
    }



    drawCanvas() {
        let c = this.refs.canvas.getContext('2d');
        let sc = this.props.scale;
        let width = this.getWidth() * sc
        let height = this.getHeight() * sc
        this.drawBackground(c,width,height);
        const layers = this.props.store.getLayers(this.props.model)
        layers.map((layer)=>this.drawLayer(c,layer))
        // this.props.model.getReverseLayers().map((layer) => this.drawLayer(c, layer));
        if(this.props.drawGrid === true) this.drawGrid(c, width, height);
        // if(this.state.hoverEffect && this.state.hoverPoint) {
        //     c.save();
        //     c.translate(0.5+this.state.xoff,0.5+this.state.yoff);
        //     this.state.hoverEffect(c,this.props.scale,this.state.hoverPoint);
        //     c.restore();
        // }
    }

    drawBackground(c, width,height) {
        let sc = this.props.scale;
        // let width = this.props.store.getTileWidth(this.props.model) * sc
        // let height = this.props.store.getTileHeight(this.props.model) * sc
        // let bg = this.props.model.getBackgroundColor();
        let bg = 0;
        c.fillStyle = 'yellow';//this.props.model.lookupCanvasColor(bg);
        c.fillRect(this.state.xoff, this.state.yoff, width, height);
    }

    drawLayer(c, layer) {
        if(!layer.get('visible')) return;
        c.save();
        c.globalAlpha = layer.get('opacity');
        let sc = this.props.scale;
        let model = this.props.model;
        for(let y=0; y<this.getHeight(); y++) {
            for (let x = 0; x < this.getWidth(); x++) {
                const val = this.props.store.getPixelOnLayer(layer, x, y);
                if(val === -1) continue;
                c.fillStyle = this.props.store.lookupPaletteColor(this.props.palette, val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }
        c.restore();
    }

    drawGrid(c, width, height) {
        c.strokeStyle = 'black';
        let sc = this.props.scale;
        c.save();
        c.translate(0.5+this.state.xoff,0.5+this.state.yoff);
        c.beginPath();
        let heigh = this.props.store.getTileHeight(this.props.model)
        let wid = this.props.store.getTileWidth(this.props.model)
        for (let i = 0; i <= heigh; i++) {
            c.moveTo(0, i * sc);
            c.lineTo(width, i * sc);
        }
        for (let i = 0; i <= wid; i++) {
            c.moveTo(i * sc, 0);
            c.lineTo(i * sc, height);
        }
        c.stroke();
        c.restore();
    }

    componentDidMount() {
        this.refs.canvas.addEventListener("gesturestart", (e)=>{
            this.startScale = e.scale;
        }, false)
        this.refs.canvas.addEventListener("gesturechange", (e)=> {
            e.preventDefault();
            e.target.style.webkitTransform = 'scale(' + e.scale + ')';
        })
        this.refs.canvas.addEventListener("gestureend", (e)=>{
            if(e.scale > this.startScale) {
                this.props.onZoomIn()
            } else {
                this.props.onZoomOut()
            }
            e.target.style.webkitTransform = '';
        }, false);
        this.drawCanvas();
    }

    componentWillReceiveProps(props) {
        this.setState({
            width:this.getWidth(),
            height:this.getHeight()
        });
        // if(props.tool) this.setState({hoverEffect: props.tool.hoverEffect});
        setTimeout(this.drawCanvas.bind(this),0);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.scale !== nextProps.scale) return true;
        if(this.props.model !== nextProps.model) return true;
        if(this.state.width !== this.props.store.getTileWidth(nextProps.model)) return true;
        if(this.state.height !== this.props.store.getTileHeight(nextProps.model)) return true;
        return false;
    }

    getModelPoint(e) {
        let rect = this.refs.canvas.getBoundingClientRect();
        return this.mouseToModel(Point.makePoint(e.clientX-rect.left, e.clientY-rect.top));
    }

    mouseDown(e) {
        if(e.button !== 0) return;
        if(e.ctrlKey) return;
        const modelPoint = this.getModelPoint(e)
        this.setState({down:true, prevPoint:modelPoint});
        this.props.tool.mouseDown(this,modelPoint);
    }

    mouseMove(e) {
        e.stopPropagation();
        let modelPoint = this.getModelPoint(e);
        this.setState({hoverPoint:modelPoint});
        if(!this.state.down) return setTimeout(this.drawCanvas.bind(this),0);
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
        let width = this.props.store.getTileWidth(this.props.model) * this.props.scale+1
        let height = this.props.store.getTileHeight(this.props.model) * this.props.scale+1
        return <canvas ref="canvas"
                tabIndex="1"
                width={width}
                height={height}
                onMouseUp={this.mouseUp.bind(this)}
                onMouseDown={this.mouseDown.bind(this)}
                onMouseMove={this.mouseMove.bind(this)}
                onContextMenu={this.contextMenu.bind(this)}
                onKeyDown={this.keyDown.bind(this)}
        />
    }
}
