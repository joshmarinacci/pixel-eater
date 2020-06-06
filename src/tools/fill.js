import {HBox} from 'appy-comps'
import DocStore from '../DocStore.js'
import {StampView} from '../common/stampview.js'
import {floodFill} from '../BitmapModel.js'
import {Point} from '../DrawingSurface.jsx'
import React from 'react'

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

