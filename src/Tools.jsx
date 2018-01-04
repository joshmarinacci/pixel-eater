import React from "react";
import ToggleButton from "./ToggleButton.jsx"
import {KEYBOARD} from "./u";
import DocStore from "./DocStore.js";
import {HBox} from "appy-comps";
import P from './P'

export class EyedropperTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf,pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        this.app.selectColor(this.app.getColorAtPixel(pt))
    }
    mouseUp() {
        this.app.selectTool(this.app.tools[0])
    }
    getOptionsPanel() {
        return <label>none</label>
    }
}

export class PencilTool {
    constructor(app, size) {
        this.app = app;
        this.size = size;
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
    }
    mouseDown(surf, pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        let col = this.app.state.selectedColor;
        this.app.drawStamp(pt,this.genStamp(this.size, col), col );
    }
    genStamp(size,col) {
        let data = [];
        for(let i=0; i<size*size; i++) {
            data[i] = col;
        }
        return {w:size, h:size, data:data};
    }
    mouseUp(surf){}
    contextMenu(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
    getOptionsPanel() {
        return <HBox>
            <ToggleButton selected={this.size === 1} onToggle={this.setSize1}>1px</ToggleButton>
            <ToggleButton selected={this.size === 3} onToggle={this.setSize3}>3px</ToggleButton>
            <ToggleButton selected={this.size === 5} onToggle={this.setSize5}>5px</ToggleButton>
        </HBox>
    }
}

export class LineTool {
    constructor(app) {
        this.app = app
        this.start = null
        this.end = null
        this.hoverEffect = (c,scale,pt) => {
            if(!this.start) return
            c.save()
            c.strokeStyle = 'orange'
            const sc = scale
            c.translate(0.5*sc,0.5*sc)
            c.beginPath()
            c.moveTo(this.start.x*sc,this.start.y*sc)
            c.lineTo(pt.x*sc,pt.y*sc)
            c.stroke()
            c.restore()
        }
    }
    mouseDown(surf,pt) {
        this.start = pt
    }
    mouseDrag(surf,pt) {
        let col = this.app.state.selectedColor;
        this.end = pt
    }
    mouseUp(surf) {
        let value = this.app.state.selectedColor;
        this.app.applyPixelChange((setter)=>{


        //bresenham's line algorithm
        let x1 = this.start.x
        let x2 = this.end.x
        let y1 = this.start.y
        let y2 = this.end.y
        let dx = Math.abs(x2 - x1)
        let dy = Math.abs(y2 - y1)
        let sx = (x1 < x2) ? 1 : -1
        let sy = (y1 < y2) ? 1 : -1
        let err = dx - dy

        //first point
        setter.drawStamp(new P(x1,y1),{ w:1, h:1, data:[value] }, value);
        //main loop
        while(!((x1 === x2) && (y1 === y2))) {
            const e2 = err << 1
            if(e2 > -dy) {
                err -= dy;
                x1 += sx;
            }
            if(e2 < dx) {
                err += dx;
                y1 += sy;
            }
            setter.drawStamp(new P(x1,y1),{ w:1, h:1, data:[value] }, value);
        }
        this.start = null
        })
    }
}

export class FillTool {
    constructor(app) {
        this.app = app
    }
    mouseDown(surf,pt) {
        this.start = new P(pt.x,pt.y)
    }
    mouseDrag(){}
    mouseUp(surf) {
        let replacement = this.app.state.selectedColor;
        let target = this.app.getColorAtPixel(this.start)
        this.floodFill(this.start,target,replacement)
    }
    floodFill(pt, target, replacement) {
        if(this.outsideTile(pt)) return
        if(target === replacement) return
        const color = this.app.getColorAtPixel(pt)
        if(color !== target) return
        this.app.setColorAtPixel(pt,replacement)
        this.floodFill(pt.translate( 1,0),target,replacement)
        this.floodFill(pt.translate(-1,0),target,replacement)
        this.floodFill(pt.translate(0,-1),target,replacement)
        this.floodFill(pt.translate(0, 1),target,replacement)
    }
    outsideTile(pt) {
        if(pt.x < 0) return true
        if(pt.y < 0) return true
        if(pt.x >= 16) return true
        if(pt.y >= 16) return true
        return false
    }
    setTileXY(x,y,color) {
        const stamp = {
            w:1,
            h:1,
            data:[color]
        }
        this.app.drawStamp(new P(x,y),stamp, color);
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
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        let col = -1;
        //this.app.setPixel(pt, -1);
        this.app.drawStamp(pt,this.genStamp(this.size, col), col );
    }
    mouseUp() {}
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