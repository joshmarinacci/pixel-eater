import DocStore from '../DocStore.js'
import React from 'react'

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
        let layer = DocStore.getDoc().model.getCurrentLayer();
        this.app.selectColor(DocStore.getDoc().model.get_xy(pt.x,pt.y,layer));
    }
    mouseUp() {
        this.app.selectTool(this.app.tools[0])
    }
}
