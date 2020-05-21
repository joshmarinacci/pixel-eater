import React, {useRef, useEffect} from "react";
import ToggleButton from "./common/ToggleButton.jsx"
import {KEYBOARD} from "./u";
import DocStore from "./DocStore.js";
import {HBox} from "appy-comps";
import {Point} from './DrawingSurface.jsx'
import {remap} from './u.js'
import {Stamp} from './BitmapModel.js'

const StampView = ({ pattern, model})=>{
    let can = useRef()
    useEffect(()=>{
        if(can.current) {
            let ctx = can.current.getContext('2d')
            ctx.fillStyle = 'black'
            ctx.fillRect(0,0,can.current.width,can.current.height)
            ctx.imageSmoothingEnabled = false
            if(pattern) {
                let sc = can.current.width/pattern.width()
                for(let x=0; x<pattern.width(); x++) {
                    for (let y = 0; y < pattern.height(); y++) {
                        let val = pattern.get_xy(x, y)
                        if(val === -1) continue
                        ctx.fillStyle = model.lookupCanvasColor(val);
                        ctx.fillRect(x * sc, y * sc, sc, sc);
                    }
                }
            }
        }
    })
    return <div><canvas ref={can} width={32} height={32} style={{border:'1px solid black'}}/></div>
}

export class EyedropperTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf,pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
    mouseUp() {
        this.app.selectTool(this.app.tools[0])
    }
    getOptionsPanel() {
        return <label>none</label>
    }
}


export class PencilTool {
    constructor(app) {
        this.app = app;
        this.size = 1;
        this.hoverEffect = (c,scale,pt) => {
            let sc = scale;
            c.save();
            c.strokeStyle = 'orange';
            c.strokeRect(pt.x*sc, pt.y*sc, sc*this.size,sc*this.size);
            c.restore();
        };

        this.setSize1 = () => this.size = 1;
        this.setSize3 = () => this.size = 3;
        this.setSize5 = () => this.size = 5;
        this.fill_mode = 'color'
    }
    mouseDown(surf, pt) {
        this.copy = this.app.makePasteClone()
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        let col = this.app.state.selectedColor;
        if(this.fill_mode === 'color') this.app.drawStamp(pt,this.genStamp(this.size, col), col );
        if(this.fill_mode === 'pattern') this.app.fillStamp(pt, this.genStamp(this.size,col), DocStore.getDoc().model.getPattern())
    }
    genStamp(size,col) {
        let stamp = new Stamp(size,size)
        for(let i=0; i<size*size; i++) {
            stamp.data[i] = col;
        }
        return stamp
    }
    mouseUp(surf){
        this.app.completePasteClone(this.copy)
    }
    contextMenu(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
    getOptionsPanel() {
        let model = DocStore.getDoc().model
        return <HBox>
            <label>pen size</label>
            <select value={this.size} onChange={(e)=>{
                this.size = parseInt(e.target.value)
                DocStore.getDoc().model.fireUpdate()
            }}>
                <option value={1}>1</option>
                <option value={3}>3</option>
                <option value={5}>5</option>
                <option value={13}>13</option>
                <option value={41}>41</option>
            </select>
            <label>draw mode</label>
            <select value={this.fill_mode} onChange={(e)=>{
                this.fill_mode = e.target.value
                DocStore.getDoc().model.fireUpdate()
            }}>
                <option value={'color'}>color</option>
                <option value={'pattern'}>pattern</option>
            </select>
            <StampView pattern={model.getPattern()} model={model}/>
        </HBox>
    }
}

export class EraserTool {
    constructor(app) {
        this.app = app;
        this.size = 1;
        this.hoverEffect = (c,scale,pt) => {
            let sc = scale;
            c.save();
            c.strokeStyle = 'orange';
            c.strokeRect(pt.x*sc, pt.y*sc, sc*this.size,sc*this.size);
            c.restore();
        }
        this.setSize1 = () => this.size = 1;
        this.setSize3 = () => this.size = 3;
        this.setSize5 = () => this.size = 5;
    }
    mouseDown(surf,pt) {
        this.copy = this.app.makePasteClone()
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        let col = -1;
        this.app.drawStamp(pt,this.genStamp(this.size, col), col );
    }
    mouseUp() {
        this.app.completePasteClone(this.copy)
    }
    genStamp(size,col) {
        let data = [];
        for(var i=0; i<size*size; i++) {
            data[i] = col;
        }
        return {w:size, h:size, data:data};
    }
    getOptionsPanel() {
        return <HBox>
            <ToggleButton selected={this.size === 1} onToggle={this.setSize1}>1px</ToggleButton>
            <ToggleButton selected={this.size === 3} onToggle={this.setSize3}>3px</ToggleButton>
            <ToggleButton selected={this.size === 5} onToggle={this.setSize5}>5px</ToggleButton>
        </HBox>
    }
}

export class MoveTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf,pt) {
        this.prev = pt;
    }
    mouseDrag(surf,pt) {
        let diff = {
            x: pt.x - this.prev.x,
            y: pt.y - this.prev.y
        };
        this.shift(diff);
        this.prev = pt;
    }
    shift(diff){
        let model = this.app.getModel()
        if(!model.selection.isDefault()) {
            let layer = model.getCurrentLayer()
            let pos = Point.makePoint(model.selection.x, model.selection.y)
            let bounds = {w: model.selection.w, h: model.selection.h}
            let stamp = model.stampFromLayer(pos,bounds,layer);

            pos.x += diff.x
            pos.y += diff.y
            model.selection.shift(diff)
            model.stampOnLayer(pos,stamp,layer)
            model.fireUpdate();
            return
        }

        if(this.app.state.shiftLayerOnly) {
            this.app.getModel().shiftSelectedLayer(diff);
        } else {
            this.app.getModel().shiftLayers(diff);
        }
    }
    toggleLayerButton() {
        this.app.setState({ shiftLayerOnly:!this.app.state.shiftLayerOnly});
    }
    mouseUp() {}
    getOptionsPanel() {
        return <div className="group">
            <ToggleButton
                onToggle={this.toggleLayerButton.bind(this)}
                selected={this.app.state.shiftLayerOnly}
            >only selected layer</ToggleButton>
        </div>
    }
    keyDown(e) {
        if(e.keyCode === KEYBOARD.ARROW_RIGHT) {
            this.shift({x:1,y:0});
            return true;
        }
        if(e.keyCode === KEYBOARD.ARROW_LEFT) {
            this.shift({x:-1,y:0});
            return true;
        }
        if(e.keyCode === KEYBOARD.ARROW_UP) {
            this.shift({x:0,y:-1});
            return true;
        }
        if(e.keyCode === KEYBOARD.ARROW_DOWN) {
            this.shift({x:0,y:1});
            return true;
        }
        return false;
    }
}


export class LineTool {
    constructor(app) {
        this.app = app;
        this.prev = Point.makePoint(0,0)
        this.curr = Point.makePoint(0,0)
        this.pressed = false
    }
    getOptionsPanel() {
        return <label>none</label>
    }
    mouseDown(surf,pt) {
        this.copy = this.app.makePasteClone()
        this.prev = pt;
        this.curr = pt;
        this.pressed = true
    }
    mouseDrag(surf,pt,e) {
        this.curr = pt
        if(e.shiftKey) {
            let sections = 8
            let diff = this.curr.sub(this.prev)
            let len = diff.length()
            let angle = Math.atan2(diff.x,diff.y) // -PI, PI
            angle = remap(angle, -Math.PI, Math.PI, 0,1) // map to 0->1
            angle = Math.floor(angle*sections)/sections // round to nearest quadrant
            angle = remap(angle, 0,1, -Math.PI, Math.PI) // map back to -PI -> PI
            diff = Point.makePointFromAngleLength(angle,len)
            this.curr = this.prev.add(diff).round()
        }
    }
    drawOverlay(ctx, scale) {
        if(!this.pressed) return
        let col = this.app.state.selectedColor;
        this.bresenhamLine(this.prev.x,this.prev.y,this.curr.x,this.curr.y,(x,y)=>{
            ctx.fillStyle = DocStore.getDoc().model.lookupCanvasColor(col)
            ctx.fillRect(x*scale,y*scale,scale,scale)
            return false
        })
        ctx.strokeStyle = 'red'
        ctx.beginPath()
        ctx.moveTo((this.prev.x+0.5)*scale,(this.prev.y+0.5)*scale)
        ctx.lineTo((this.curr.x+0.5)*scale,(this.curr.y+0.5)*scale)
        ctx.stroke()
    }
    mouseUp() {
        this.pressed = false
        let col = this.app.state.selectedColor;
        this.bresenhamLine(this.prev.x,this.prev.y,this.curr.x,this.curr.y,(x,y)=>{
            let pt = Point.makePoint(x,y)
            this.app.drawStamp(pt,this.genStamp(1, col), col );
            return false
        })
        this.curr = Point.makePoint(-1,-1)
        this.prev = Point.makePoint(-1,-1)
        this.app.completePasteClone(this.copy)
    }
    contextMenu(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
    genStamp(size,col) {
        let data = [];
        for(let i=0; i<size*size; i++) {
            data[i] = col;
        }
        return {w:size, h:size, data:data};
    }

    bresenhamLine(x0, y0, x1, y1, callback) {
        callback(x0, y0)
        var dx = Math.abs(x1 - x0),
            dy = Math.abs(y1 - y0),
            sx = x0 < x1 ? 1 : -1,
            sy = y0 < y1 ? 1 : -1,
            err = dx - dy;

        while (x0 != x1 || y0 != y1) {
            var e2 = 2 * err;
            if (e2 > (dy * -1)) {
                err -= dy;
                x0 += sx;
            }
            if (e2 < dx) {
                err += dx;
                y0 += sy;
            }
            if (callback(x0, y0) === true) {
                return;
            }
        }
    }
}

export class FillTool {
    constructor(app) {
        this.app = app
        this.fill_mode = 'color'
    }
    mouseDown(surf,pt) {
        this.copy = this.app.makePasteClone()
        let model = DocStore.getDoc().model
        let layer = model.getCurrentLayer();
        let src_col = model.getData(pt)
        if(this.fill_mode === 'color') {
            let dst_col = this.app.state.selectedColor;
            this.floodFill(model,pt,src_col,dst_col,layer)
        } else {
            let temp_col = -2
            this.floodFill(model, pt, src_col, temp_col, layer)
            this.replaceWithPattern(model, temp_col, model.getPattern(), layer)
        }
    }

    contextMenu(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }

    floodFill(model, pt, src_col, dst_col,layer) {
        if(pt.x < 0) return
        if(pt.y < 0) return
        if(pt.x >= model.getWidth()) return
        if(pt.y >= model.getHeight()) return
        if(!model.selection.inside(pt)) return
        let cur = model.getData(pt)
        if(cur !== src_col) return
        model.setData(pt,dst_col,layer)
        this.floodFill(model,Point.makePoint(pt.x+1,pt.y),src_col,dst_col,layer)
        this.floodFill(model,Point.makePoint(pt.x,pt.y+1),src_col,dst_col,layer)
        this.floodFill(model,Point.makePoint(pt.x-1,pt.y),src_col,dst_col,layer)
        this.floodFill(model,Point.makePoint(pt.x,pt.y-1),src_col,dst_col,layer)
    }

    replaceWithPattern(model, src, pattern, layer) {
        for(let i=0; i<model.getWidth(); i++) {
            for(let j=0; j<model.getHeight(); j++) {
                let pt = Point.makePoint(i,j)
                let cur = model.getData(pt)
                if(cur === src) {
                    let c = pattern.get_xy(i%pattern.width(),j%pattern.height())
                    model.setData(pt, c, layer)
                }
            }
        }
    }

    getOptionsPanel() {
        let model = DocStore.getDoc().model
        return <HBox>
            <select value={this.fill_mode} onChange={(e)=>{
                this.fill_mode = e.target.value
                DocStore.getDoc().model.fireUpdate()
            }}>
                <option value={'color'}>color</option>
                <option value={'pattern'}>pattern</option>
            </select>
            <StampView pattern={model.getPattern()} model={model}/>
        </HBox>
    }
    mouseDrag(surf,pt) {

    }
    mouseUp(surf,pt) {
        this.app.completePasteClone(this.copy)
    }
}

export class SelectionTool {
    constructor(app) {
        this.app = app
        this.inside = false
    }
    definePatternFromSelection() {
        let model = DocStore.getDoc().model
        model.setPattern(model.make_stamp_from_selection())
    }
    getOptionsPanel() {
        let model = DocStore.getDoc().model
        return <HBox>
            <button onClick={this.definePatternFromSelection.bind(this)}>define pattern</button>
            <StampView pattern={model.getPattern()} model={model}/>
        </HBox>
    }
    mouseDown(surf,pt) {
        this.start = pt
        let model = DocStore.getDoc().model
        if(model.selection.inside(pt) && !model.selection.isDefault()) {
            console.log("starting inside")
            this.inside = true
            this.start_off = Point.makePoint(model.selection.x, model.selection.y)
        }
    }
    mouseDrag(surf,pt) {
        let model = DocStore.getDoc().model
        if(this.inside) {
            let diff = pt.sub(this.start)
            diff = diff.add(this.start_off)
            model.positionSelection(diff)
        } else {
            model.selection.setFrame(this.start, pt)
        }
    }
    mouseUp() {
        this.inside = false
    }
    keyDown(e) {
        let model = DocStore.getDoc().model

        if(e.key === 'c' && e.metaKey) {
            console.log("typed copy")
            let layer = model.getCurrentLayer()
            let pos = Point.makePoint(model.selection.x, model.selection.y)
            let bounds = {w: model.selection.w, h: model.selection.h}
            let stamp = model.stampFromLayer(pos,bounds,layer);
            this.copy_buffer = stamp
            this.copy_pos = pos
            console.log('copied',this.copy_pos,this.copy_buffer)
            return
        }
        if(e.key === 'v' && e.metaKey) {
            console.log("typed paste")
            let layer = model.appendLayer();
            model.stampOnLayer(this.copy_pos,this.copy_buffer,layer)
            model.setSelectedLayer(layer);
            return
        }


        if(e.keyCode === KEYBOARD.ARROW_RIGHT) {
            model.shiftSelection(Point.makePoint(1,0))
            return true;
        }
        if(e.keyCode === KEYBOARD.ARROW_LEFT) {
            model.shiftSelection(Point.makePoint(-1,0))
            return true;
        }
        if(e.keyCode === KEYBOARD.ARROW_UP) {
            model.shiftSelection(Point.makePoint(0,-1))
            return true;
        }
        if(e.keyCode === KEYBOARD.ARROW_DOWN) {
            model.shiftSelection(Point.makePoint(0,1))
            return true;
        }
        return false;
    }

}
