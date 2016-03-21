require('./flexbox.css');

import React from "react";
import ReactDOM from "react-dom";
import DrawingSurface from "./DrawingSurface.jsx"
import LayersPanel from "./LayersPanel.jsx";
import BitmapModel from "./BitmapModel.js";




class Toolbar extends React.Component {
    render() {
        return <div className="vbox">
            <button>color</button>
            <button>pencil</button>
            <button>eraser</button>
            <button>undo</button>
            <button>redo</button>
            <button>export</button>
        </div>
    }
}

var model = new BitmapModel(16,16);

var pencil_tool = {
    mouseDown: function(surf) {
    },
    mouseDrag: function(surf,pt) {
        model.setData(pt,1);
    },
    mouseUp:function(surf){
    }
};




ReactDOM.render(<div className="hbox fill">
    <Toolbar/>
    <DrawingSurface tool={pencil_tool} model={model}/>
    <LayersPanel/>
</div>,
    document.getElementsByTagName("body")[0]);