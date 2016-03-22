require('./flexbox.css');

import React from "react";
import ReactDOM from "react-dom";
import DrawingSurface from "./DrawingSurface.jsx"
import LayersPanel from "./LayersPanel.jsx";
import BitmapModel from "./BitmapModel.js";
import ExportPNG from "./ExportPng";

var model = new BitmapModel(16,16);

var PopupState = {

};

class ColorPicker extends React.Component {
    selectColor(c,e) {
        console.log("selected color",c);
        e.stopPropagation();
    }
    renderColorWell(c) {
        return <div key={c}
                    style={{border:'0px solid black', backgroundColor:c, width:32,height:32, display:'inline-block', margin:0, padding:0}}
                    onClick={this.selectColor.bind(this,c)}
        ></div>
    }
    render() {
        var colors = ['red','green','blue','yellow','white','black'];
        var wells = colors.map(c => this.renderColorWell(c));
        return <div
            style={{
                    margin:0,
                    padding:0,
                    display:'flex',
                    flexDirection:'row',
                    flexWrap:'wrap',
                    width:32*3
            }}
        >{wells}</div>
    }
}

class PopupButton extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open:false
        }
    }
    componentDidMount() {
        //PopupState.listen()
    }
    clicked() {
        this.setState({
            open:true
        })
    }
    render() {
        return <button style={{ position: 'relative' }} onClick={this.clicked.bind(this)}>
            {this.props.caption}
            <div style={{
                    position: 'absolute',
                    left:'100%',
                    top:0,
                    border: "1px solid #666",
                    backgroundColor:'white',
                    padding:'1em',
                    borderRadius:'0.5em',
                    display:this.state.open?'block':'none'
                    }}
            >{this.props.children}</div>
        </button>
    }
}

class Toolbar extends React.Component {
    exportPNG() {
        ExportPNG(model);
    }
    render() {
        return <div className="vbox">
            <PopupButton caption="Color"><ColorPicker/></PopupButton>
            <button>pencil</button>
            <button>eraser</button>
            <button>undo</button>
            <button>redo</button>
            <button onClick={this.exportPNG.bind(this)}>export</button>
        </div>
    }
}


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