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


ReactDOM.render(<div className="hbox fill">
    <Toolbar/>
    <DrawingSurface/>
    <LayersPanel/>
</div>,
    document.getElementsByTagName("body")[0]);