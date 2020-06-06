import {HBox} from 'appy-comps'
import DocStore from '../DocStore.js'
import {Point} from '../DrawingSurface.jsx'
import {Stamp} from '../BitmapModel.js'
import React from 'react'
import {StampView} from '../common/stampview.js'

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
        let layer = DocStore.getDoc().model.getCurrentLayer();
        this.app.selectColor(DocStore.getDoc().model.get_xy(pt.x,pt.y,layer));
    }
}
