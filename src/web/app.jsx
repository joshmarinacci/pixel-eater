require('./flexbox.css');

import React from "react";
import ReactDOM from "react-dom";

class BitmapModel {

}

class DrawingSurface extends React.Component {
    render() {
        return <div className="grow">drawing surface</div>
    }
}

class LayersPanel extends React.Component {
    render() {
        return <ul><li>layer 1</li><li>layer 2</li></ul>
    }
}

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


ReactDOM.render(<div className="hbox fill debug">
    <Toolbar/>
    <DrawingSurface/>
    <LayersPanel/>
</div>,
    document.getElementsByTagName("body")[0]);