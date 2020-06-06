import DocStore from '../DocStore.js'
import {HBox} from 'appy-comps'
import ToggleButton from '../common/ToggleButton.jsx'
import React from 'react'

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
