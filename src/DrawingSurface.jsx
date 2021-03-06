import React, {Component} from "react";

export class Point {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
    static makePoint(x,y) {
        return new Point(x,y)
    }
    equals(pt) {
        if(!pt) return false;
        return pt.x === this.x && pt.y === this.y;
    }
    add(pt) {
        return Point.makePoint(this.x + pt.x, this.y + pt.y)
    }
    sub(pt) {
        return Point.makePoint(this.x - pt.x, this.y - pt.y)
    }
    round() {
        return Point.makePoint(Math.round(this.x), Math.round(this.y))
    }
    length() {
        return Math.sqrt(this.x*this.x + this.y*this.y)
    }

    static makePointFromAngleLength(angle, len) {
        return Point.makePoint(Math.sin(angle)*len,  Math.cos(angle)*len)
    }
}

export default class DrawingSurface extends Component {
    constructor(props) {
        super(props);
        this.state = {
            down: false,
            xoff: 0,
            yoff: 0,
            width: props.model.getWidth(),
            height: props.model.getHeight(),
            hoverEffect: null,
            hoverPoint: null
        };

        this.props.model.changed(() => this.drawCanvas());
        this.mouse_down_handler = (e) => this.mouseDown(e)
        this.mouse_move_handler = (e) => this.mouseMove(e)
        this.mouse_up_handler = (e) => this.mouseUp(e)

        this.touch_start_handler = (e)=>{
            if(this.props.scrollTouch) return
            e.preventDefault()
            e.stopPropagation()
            let modelPoint = this.getModelPoint_touch(e)
            this.setState({down:true, prevPoint:modelPoint});
            let name = this.props.selected_tool.name
            this.props.tool.mouseDown(this,modelPoint,this.props.doc.tools[name].state,e);
        }
        this.touch_move_handler = (e) => {
            if(this.props.scrollTouch) return
            e.preventDefault()
            e.stopPropagation()
            let modelPoint = this.getModelPoint_touch(e);
            this.setState({hoverPoint:modelPoint});
            if(!this.state.down) return setTimeout(this.drawCanvas.bind(this),0);
            if(!modelPoint.equals(this.state.prevPoint)) {
                let name = this.props.selected_tool.name
                this.props.tool.mouseDrag(this,modelPoint,this.props.doc.tools[name].state,e);
                this.setState({prevPoint:modelPoint});
                return setTimeout(this.drawCanvas.bind(this),0);
            }
        }
        this.touch_end_handler = (e) => {
            if(this.props.scrollTouch) return
            e.preventDefault()
            e.stopPropagation()
            this.setState({down:false});
            let name = this.props.selected_tool.name
            let modelPoint = this.getModelPoint_touch(e);
            this.props.tool.mouseUp(this,modelPoint,this.props.doc.tools[name].state,e);
            return setTimeout(this.drawCanvas.bind(this),0);
        }
    }



    drawCanvas() {
        let c = this.refs.canvas.getContext('2d');

        this.drawBackground(c);
        this.props.model.getReverseLayers().map((layer) => this.drawLayer(c, layer));
        if(this.props.drawGrid === true) this.drawGrid(c);
        this.drawSelection(c,this.props.model.selection, this.props.scale)
        let name = this.props.selected_tool.name
        let tool_state = this.props.doc.tools[name].state
        if(this.props.tool.drawOverlay) {
            c.save()
            this.props.tool.drawOverlay(c,this.props.scale,tool_state)
            c.restore()
        }
        if(this.state.hoverEffect && this.state.hoverPoint) {
            c.save();
            c.translate(0.5+this.state.xoff,0.5+this.state.yoff);
            this.state.hoverEffect(c,this.props.scale,this.state.hoverPoint,tool_state);
            c.restore();
        }
    }

    drawBackground(c) {
        let sc = this.props.scale;
        let width = this.props.model.getWidth() * sc;
        let height = this.props.model.getHeight() * sc;
        let bg = this.props.model.getBackgroundColor();
        c.fillStyle = this.props.model.lookupCanvasColor(bg);
        c.fillRect(this.state.xoff, this.state.yoff, width, height);
    }

    drawLayer(c, layer) {
        if(!layer.visible) return;
        c.save();
        c.globalAlpha = layer.opacity;
        let sc = this.props.scale;
        let model = this.props.model;
        for(let y=0; y<model.getHeight(); y++) {
            for (let x = 0; x < model.getWidth(); x++) {
                let val = model.getPixelFromLayer(x, y, layer);
                if(val === -1) continue;
                c.fillStyle = model.lookupCanvasColor(val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }
        c.restore();
    }

    drawGrid(c) {
        c.strokeStyle = 'black';
        let sc = this.props.scale;
        let width = this.props.model.getWidth() * sc;
        let height = this.props.model.getHeight() * sc;
        c.save();
        c.translate(0.5+this.state.xoff,0.5+this.state.yoff);
        c.beginPath();
        for (let i = 0; i <= this.props.model.getHeight(); i+=8) {
            c.moveTo(0, i * sc);
            c.lineTo(width, i * sc);
        }
        for (let i = 0; i <= this.props.model.getWidth(); i+=8) {
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
        if(props.tool) this.setState({hoverEffect: props.tool.hoverEffect});
        setTimeout(this.drawCanvas.bind(this),0);
    }

    shouldComponentUpdate(nextProps, nextState) {
        if(this.props.scrollTouch !== nextProps.scrollTouch) return true
        if(this.props.scale !== nextProps.scale) return true;
        if(this.props.model !== nextProps.model) return true;
        if(this.state.width !== nextProps.model.getWidth()) return true;
        if(this.state.height !== nextProps.model.getHeight()) return true;
        return false;
    }

    getModelPoint(e) {
        let rect = this.refs.canvas.getBoundingClientRect();
        return this.mouseToModel(Point.makePoint(e.clientX-rect.left, e.clientY-rect.top));
    }
    getModelPoint_touch(e) {
        let rect = this.refs.canvas.getBoundingClientRect()
        let touch = e.changedTouches[0]
        return this.mouseToModel(Point.makePoint(touch.clientX-rect.left, touch.clientY-rect.top));
    }

    mouseDown(e) {
        if(e.button !== 0) return;
        if(e.ctrlKey) return;
        let modelPoint = this.getModelPoint(e)
        this.setState({down:true, prevPoint:modelPoint});
        let name = this.props.selected_tool.name
        this.props.tool.mouseDown(this,modelPoint,this.props.doc.tools[name].state,e);
        document.addEventListener('mousemove',this.mouse_move_handler)
        document.addEventListener('mouseup',this.mouse_up_handler)
    }

    mouseMove(e) {
        e.stopPropagation();
        let modelPoint = this.getModelPoint(e);
        this.setState({hoverPoint:modelPoint});
        if(!this.state.down) return setTimeout(this.drawCanvas.bind(this),0);
        if(!modelPoint.equals(this.state.prevPoint)) {
            let name = this.props.selected_tool.name
            this.props.tool.mouseDrag(this,modelPoint,this.props.doc.tools[name].state,e);
            this.setState({prevPoint:modelPoint});
            return setTimeout(this.drawCanvas.bind(this),0);
        }
    }

    mouseToModel(mousePoint) {
        return Point.makePoint(
            Math.floor((mousePoint.x-this.state.xoff)/this.props.scale),
            Math.floor((mousePoint.y-this.state.yoff)/this.props.scale));
    }

    mouseUp(e) {
        e.stopPropagation();
        document.removeEventListener('mousemove',this.mouse_move_handler)
        document.removeEventListener('mouseup',this.mouse_up_handler)
        this.setState({down:false});
        let name = this.props.selected_tool.name
        let modelPoint = this.getModelPoint(e);
        this.props.tool.mouseUp(this,modelPoint,this.props.doc.tools[name].state,e);
        return setTimeout(this.drawCanvas.bind(this),0);
    }

    keyDown(e) {
        if(this.props.tool.keyDown) this.props.tool.keyDown(e)
    }

    contextMenu(e) {
        e.preventDefault();
        e.stopPropagation();
        if(this.props.tool.contextMenu) {
            this.props.tool.contextMenu(this,this.getModelPoint(e));
        }
    }

    render() {
        return <div className="grow scroll" id={"drawing-surface"}>
            <canvas ref="canvas"
                    style={{ touchAction:this.props.scrollTouch?"auto":"none" }}
                    tabIndex="1"
                    width={this.props.model.getWidth()*this.props.scale+1}
                    height={this.props.model.getHeight()*this.props.scale+1}
                    onMouseDown={this.mouse_down_handler}
                    onContextMenu={this.contextMenu.bind(this)}
                    onKeyDown={this.keyDown.bind(this)}
                    onTouchStart={this.touch_start_handler}
                    onTouchMove={this.touch_move_handler}
                    onTouchEnd={this.touch_end_handler}
            />
        </div>
    }

    drawSelection(ctx, selection, scale) {
        ctx.save()
        ctx.strokeStyle = 'yellow'
        ctx.lineWidth = 2.0
        ctx.strokeRect(selection.x*scale-1,
            selection.y*scale-1,
            selection.w*scale+3,
            selection.h*scale+3)
        ctx.restore()
    }
}
