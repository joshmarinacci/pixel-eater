import React from "react";
import ToggleButton from "./ToggleButton.jsx"
import {KEYBOARD} from "./u";
import DocStore from "./DocStore.js";

export class PencilTool {
    constructor(app) {
        this.app = app;
        this.size = 1;
        this.hoverEffect = (c,scale,pt) => {
            var sc = scale;
            c.save();
            c.strokeStyle = 'orange';
            c.strokeRect(pt.x*sc, pt.y*sc, sc*this.size,sc*this.size);
            c.restore();
        }
    }
    mouseDown(surf, pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        var col = this.app.state.selectedColor;
        this.app.drawStamp(pt,this.genStamp(this.size, col), col );
    }
    genStamp(size,col) {
        var data = [];
        for(var i=0; i<size*size; i++) {
            data[i] = col;
        }
        return {w:size, h:size, data:data};
    }
    mouseUp(surf){}
    contextMenu(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
    setSize(size) {
        this.size = size;
    }
    getOptionsPanel() {
        return <div className="hbox">
            <ToggleButton selected={this.size == 1} onToggle={this.setSize.bind(this,1)}>1px</ToggleButton>
            <ToggleButton selected={this.size == 3} onToggle={this.setSize.bind(this,3)}>3px</ToggleButton>
            <ToggleButton selected={this.size == 5} onToggle={this.setSize.bind(this,5)}>5px</ToggleButton>
        </div>
    }


}

export class EraserTool {
    constructor(app) {
        this.app = app;
        this.size = 1;
        this.hoverEffect = (c,scale,pt) => {
            var sc = scale;
            c.save();
            c.strokeStyle = 'orange';
            c.strokeRect(pt.x*sc, pt.y*sc, sc*this.size,sc*this.size);
            c.restore();
        }
    }
    mouseDown(surf,pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        var col = -1;
        //this.app.setPixel(pt, -1);
        this.app.drawStamp(pt,this.genStamp(this.size, col), col );
    }
    mouseUp() {}
    setSize(size) {
        this.size = size;
    }
    genStamp(size,col) {
        var data = [];
        for(var i=0; i<size*size; i++) {
            data[i] = col;
        }
        return {w:size, h:size, data:data};
    }
    getOptionsPanel() {
        return <div className="hbox">
            <ToggleButton selected={this.size == 1} onToggle={this.setSize.bind(this,1)}>1px</ToggleButton>
            <ToggleButton selected={this.size == 3} onToggle={this.setSize.bind(this,3)}>3px</ToggleButton>
            <ToggleButton selected={this.size == 5} onToggle={this.setSize.bind(this,5)}>5px</ToggleButton>
        </div>
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
        var diff = {
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
        if(e.keyCode == KEYBOARD.ARROW_RIGHT) {
            this.shift({x:1,y:0});
            return true;
        }
        if(e.keyCode == KEYBOARD.ARROW_LEFT) {
            this.shift({x:-1,y:0});
            return true;
        }
        if(e.keyCode == KEYBOARD.ARROW_UP) {
            this.shift({x:0,y:-1});
            return true;
        }
        if(e.keyCode == KEYBOARD.ARROW_DOWN) {
            this.shift({x:0,y:1});
            return true;
        }
        return false;
    }
}