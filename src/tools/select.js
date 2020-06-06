import DocStore from '../DocStore.js'
import {HBox} from 'appy-comps'
import {StampView} from '../common/stampview.js'
import {Point} from '../DrawingSurface.jsx'
import {KEYBOARD} from '../u.js'
import React from 'react'

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
