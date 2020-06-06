import DocStore from '../DocStore.js'
import {HBox} from 'appy-comps'
import ToggleButton from '../common/ToggleButton.jsx'
import {Point} from '../DrawingSurface.jsx'
import {remap} from '../u.js'
import React from 'react'


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
        let layer = DocStore.getDoc().model.getCurrentLayer();
        this.app.selectColor(DocStore.getDoc().model.get_xy(pt.x,pt.y,layer));
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

