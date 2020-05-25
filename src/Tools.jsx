import React, {useRef, useEffect} from "react";
import ToggleButton from "./common/ToggleButton.jsx"
import {KEYBOARD} from "./u";
import DocStore from "./DocStore.js";
import {HBox} from "appy-comps";
import {Point} from './DrawingSurface.jsx'
import {remap} from './u.js'
import {floodFill, Stamp} from './BitmapModel.js'

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

export const EyedropperToolOptions = ({doc}) => {
    return <label>none</label>
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
}

export const PencilToolOptions = ({doc})=>{
    return <HBox className={'hbox-center'}>
        <label>pen size</label>
        <select value={doc.tools.pencil.state.size} onChange={(e)=>{
            doc.tools.pencil.state.size = parseInt(e.target.value)
            DocStore.fireUpdate()
        }}>
            <option value={1}>1</option>
            <option value={3}>3</option>
            <option value={5}>5</option>
            <option value={13}>13</option>
            <option value={41}>41</option>
        </select>
        <label>draw mode</label>
        <select value={doc.tools.pencil.state.fill_mode} onChange={(e)=>{
            doc.tools.pencil.state.fill_mode = e.target.value
            DocStore.fireUpdate()
        }}>
            <option value={'color'}>color</option>
            <option value={'pattern'}>pattern</option>
        </select>
        <StampView pattern={doc.model.getPattern()} model={doc.model}/>
    </HBox>
}
export class PencilTool {
    constructor(app) {
        this.app = app;
        this.hoverEffect = (c,scale,pt,state) => {
            let sc = scale;
            c.save();
            c.strokeStyle = 'orange';
            let size = state.size
            let off = Math.floor(size/2)
            c.strokeRect(pt.x*sc-off*sc, pt.y*sc-off*sc, sc*size,sc*size);
            c.restore();
        };
    }
    mouseDown(surf,pt, state) {
        this.copy = this.app.makePasteClone()
        this.mouseDrag(surf,pt,state);
    }
    mouseDrag(surf,pt,state,e) {
        let col = this.app.state.selectedColor;
        let off = Math.floor(state.size/2)
        pt = Point.makePoint(pt.x-off,pt.y-off)
        if(state.fill_mode === 'color')   this.app.drawStamp(pt, this.genStamp(state.size, col), col );
        if(state.fill_mode === 'pattern') this.app.fillStamp(pt, this.genStamp(state.size, col), DocStore.getDoc().model.getPattern())
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
}

export const EraserToolOptions = ({doc})=>{
    let state = doc.tools.eraser.state
    const setSize = (size)=>{
        doc.tools.eraser.state.size = size
        DocStore.fireUpdate()
    }
    return <HBox>
        <ToggleButton selected={state.size === 1} onToggle={()=>setSize(1)}>1px</ToggleButton>
        <ToggleButton selected={state.size === 3} onToggle={()=>setSize(3)}>3px</ToggleButton>
        <ToggleButton selected={state.size === 5} onToggle={()=>setSize(5)}>5px</ToggleButton>
    </HBox>
}
export class EraserTool {
    constructor(app) {
        this.app = app;
        this.hoverEffect = (c,scale,pt,state) => {
            let size = state.size
            let sc = scale;
            c.save();
            c.strokeStyle = 'orange';
            c.strokeRect(pt.x*sc, pt.y*sc, sc*size,sc*size);
            c.restore();
        }
    }
    mouseDown(surf,pt,state) {
        this.copy = this.app.makePasteClone()
        this.mouseDrag(surf,pt,state);
    }
    mouseDrag(surf,pt,state) {
        let col = -1;
        this.app.drawStamp(pt,this.genStamp(state.size, col), col );
    }
    mouseUp() {
        this.app.completePasteClone(this.copy)
    }
    genStamp(size,col) {
        let data = [];
        for(let i=0; i<size*size; i++) data[i] = col;
        return {w:size, h:size, data:data};
    }
}

export const MoveToolOptions = ({doc})=>{
    const toggleLayerButton = () => {
        doc.tools.move.state.shiftLayerOnly = !doc.tools.move.state.shiftLayerOnly
        DocStore.fireUpdate()
    }
    return <div className="group">
        <ToggleButton
            onToggle={toggleLayerButton}
            selected={doc.tools.move.state.shiftLayerOnly}
        >only selected layer</ToggleButton>
    </div>
}
export class MoveTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf,pt,state) {
        this.prev = pt;
    }
    mouseDrag(surf,pt,state) {
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

        if(this.app.props.doc.tools.move.state.shiftLayerOnly) {
            this.app.getModel().shiftSelectedLayer(diff);
        } else {
            this.app.getModel().shiftLayers(diff);
        }
    }
    mouseUp() {}
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


export const LineToolOptions = ({doc}) => {
    let mode = doc.tools.line.state.mode
    const setMode = (mode) => {
        doc.tools.line.state.mode = mode
        DocStore.fireUpdate()
    }
    return <HBox>
        <ToggleButton selected={mode==='line'} onClick={()=>setMode('line')}>line</ToggleButton>
        <ToggleButton selected={mode==='rect'} onClick={()=>setMode('rect')}>rect</ToggleButton>
        <ToggleButton selected={mode==='circle'} onClick={()=>setMode('circle')}>circle</ToggleButton>
    </HBox>
}
export class LineTool {
    constructor(app) {
        this.app = app;
        this.prev = Point.makePoint(0,0)
        this.curr = Point.makePoint(0,0)
        this.pressed = false
    }
    mouseDown(surf,pt) {
        this.copy = this.app.makePasteClone()
        this.prev = pt;
        this.curr = pt;
        this.pressed = true
    }
    mouseDrag(surf,pt,state,e) {
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
    drawOverlay(ctx, scale, state) {
        if(!this.pressed) return
        let col = this.app.state.selectedColor;
        let mode = state.mode
        if(mode === 'line') {
            this.bresenhamLine(this.prev.x, this.prev.y, this.curr.x, this.curr.y, (x, y) => {
                ctx.fillStyle = DocStore.getDoc().model.lookupCanvasColor(col)
                ctx.fillRect(x * scale, y * scale, scale, scale)
                return false
            })
            ctx.strokeStyle = 'red'
            ctx.beginPath()
            ctx.moveTo((this.prev.x + 0.5) * scale, (this.prev.y + 0.5) * scale)
            ctx.lineTo((this.curr.x + 0.5) * scale, (this.curr.y + 0.5) * scale)
            ctx.stroke()
        }
        if(mode === 'rect') {
            this.bresenhamRect(this.prev,this.curr, (x,y)=>{
                ctx.fillStyle = DocStore.getDoc().model.lookupCanvasColor(col)
                ctx.fillRect(x * scale, y * scale, scale, scale)
                return false
            })
        }
        if(mode === 'circle') {
            this.bresenhamCircle(this.prev,this.curr, (x,y)=>{
                ctx.fillStyle = DocStore.getDoc().model.lookupCanvasColor(col)
                ctx.fillRect(x * scale, y * scale, scale, scale)
                return false
            })
        }
    }
    mouseUp(surf,pt,state) {
        this.pressed = false
        let col = this.app.state.selectedColor;
        let mode = state.mode
        if(mode === 'line') {
            this.bresenhamLine(this.prev.x, this.prev.y, this.curr.x, this.curr.y, (x, y) => {
                let pt = Point.makePoint(x, y)
                this.app.drawStamp(pt, this.genStamp(1, col), col);
                return false
            })
        }
        if(mode === 'rect') {
            this.bresenhamRect(this.prev,this.curr,(x,y)=>{
                let pt = Point.makePoint(x, y)
                this.app.drawStamp(pt, this.genStamp(1, col), col);
                return false
            })
        }
        if(mode === 'circle') {
            this.bresenhamCircle(this.prev,this.curr,(x,y)=>{
                let pt = Point.makePoint(x, y)
                this.app.drawStamp(pt, this.genStamp(1, col), col);
                return false
            })
        }
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

    bresenhamRect(start,end,cb) {
        let sx = start.x
        let ex = end.x
        let sy = start.y
        let ey = end.y
        if(sx > ex) {
            ex = start.x
            sx = end.x
        }
        if(sy > ey) {
            ey = start.y
            sy = end.y
        }
        for(let x = sx; x<=ex; x++) {
            cb(x,start.y)
            cb(x,end.y)
        }
        for(let y = sy; y<=ey; y++) {
            cb(start.x,y)
            cb(end.x,y)
        }
    }
    bresenhamCircle(start,end,cb) {
        draw_ellipse(start.x,start.y,end.x-start.x,end.y-start.y,cb)
    }
}

function draw_ellipse(x0, y0, a, b,cb) {
    rasterize(x0, y0, a, b, true, cb);
    rasterize(x0, y0, b, a, false, cb);
}
function rasterize(x0, y0, a, b, hw, cb) {
    var a2 = a*a;
    var b2 = b*b;

    var d  = 4*b2 - 4*b*a2 + a2;
    var delta_A = 4*3*b2;
    var delta_B = 4*(3*b2 - 2*b*a2 + 2*a2);

    var limit   = (a2*a2)/(a2+b2);

    var x = 0;
    var y = b;
    while (true) {
        if (hw)
            ellipse_points(x0, y0, x, y, cb);
        else
            ellipse_points(x0, y0, y, x, cb);

        if (x * x >= limit)
            break;

        if (d > 0) {
            d       += delta_B;
            delta_A += 4*2*b2;
            delta_B += 4*(2*b2 + 2*a2);

            x += 1;
            y -= 1;
        }
        else {
            d       += delta_A;
            delta_A += 4*2*b2;
            delta_B += 4*2*b2;

            x += 1;
        }
    }
}
function ellipse_points(x0, y0, x, y, cb) {
    cb(x0+x,y0+y)
    cb(x0-x,y0+y)
    cb(x0+x,y0-y)
    cb(x0-x,y0-y)
}

export const FillToolOptions = ({doc})=>{
    let mode = doc.tools.fill.state.mode
    let model = doc.model
    return <HBox>
        <select value={mode} onChange={(e)=>{
            doc.tools.fill.state.mode = e.target.value
            DocStore.fireUpdate()
        }}>
            <option value={'color'}>color</option>
            <option value={'pattern'}>pattern</option>
        </select>
        <StampView pattern={model.getPattern()} model={model}/>
    </HBox>

}
export class FillTool {
    constructor(app) {
        this.app = app
    }
    mouseDown(surf,pt,state) {
        this.copy = this.app.makePasteClone()
        let model = DocStore.getDoc().model
        let layer = model.getCurrentLayer();
        let src_col = model.getData(pt)
        if(state.mode === 'color') {
            let dst_col = this.app.state.selectedColor;
            floodFill(model,layer,pt,src_col,dst_col)
        } else {
            let temp_col = -2
            floodFill(model,layer,pt,src_col,temp_col)
            this.replaceWithPattern(model, temp_col, model.getPattern(), layer)
        }
    }
    contextMenu(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
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
    mouseDrag(surf,pt) {

    }
    mouseUp(surf,pt) {
        this.app.completePasteClone(this.copy)
    }
}

export const SelectionToolOptions = ({doc})=>{
    let model = doc.model
    function definePatternFromSelection() {
        let model = DocStore.getDoc().model
        model.setPattern(model.make_stamp_from_selection())
    }
    return <HBox>
        <button onClick={definePatternFromSelection}>define pattern</button>
        <StampView pattern={model.getPattern()} model={model}/>
    </HBox>
}
export class SelectionTool {
    constructor(app) {
        this.app = app
        this.inside = false
    }
    mouseDown(surf,pt) {
        this.start = pt
        let model = DocStore.getDoc().model
        if(model.selection.inside(pt) && !model.selection.isDefault()) {
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
