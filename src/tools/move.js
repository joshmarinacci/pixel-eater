import DocStore from '../DocStore.js'
import ToggleButton from '../common/ToggleButton.jsx'
import {Point} from '../DrawingSurface.jsx'
import {KEYBOARD} from '../u.js'
import React from 'react'

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

