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
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
    mouseUp() {
        this.app.selectTool(this.app.tools[0])
    }
}
