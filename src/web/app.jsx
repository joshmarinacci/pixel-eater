require('./flexbox.css');
require('./components.css');

import React from "react";
import ReactDOM from "react-dom";
import DrawingSurface from "./DrawingSurface.jsx"
import LayersPanel from "./LayersPanel.jsx";
import BitmapModel from "./BitmapModel.js";
import ExportPNG from "./ExportPng";

var model = new BitmapModel(16,16);


var PopupState = {
    cbs:[],
    done: function() {
        this.cbs.forEach(cb => cb());
    },
    listen: function(cb) {
        this.cbs.push(cb);
        return cb;
    },
    unlisten: function(cb) {
        var n = this.cbs.indexOf(cb);
        this.cbs.splice(n,1);
    }
};

class ColorPicker extends React.Component {
    selectColor(c,i,e) {
        e.stopPropagation();
        PopupState.done();
        this.props.onSelectColor(i);
    }
    renderColorWell(c,i) {
        return <div key={i}
                    style={{border:'0px solid black', backgroundColor:c, width:32,height:32, display:'inline-block', margin:0, padding:0}}
                    onClick={this.selectColor.bind(this,c,i)}
        ></div>
    }
    render() {
        var wells = model.getPalette().map((c,i) => this.renderColorWell(c,i));
        return <div
            style={{
                    margin:0,
                    padding:0,
                    display:'flex',
                    flexDirection:'row',
                    flexWrap:'wrap',
                    width:32*16
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
        var self = this;
        this.listener = PopupState.listen(function(){
            self.setState({open:false});
        })
    }
    componentWillUnmount() {
        PopupButton.unlisten(this.listener);
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

class ToggleButton extends React.Component {
    render() {
        var cls = 'button';
        if(this.props.selected === true)  cls += " selected";
        return <button className={cls} onClick={this.props.onToggle}>{this.props.children}</button>
    }
}

class ColorWellButton extends React.Component {
    render() {
        return <button className="color-well" style={{
            backgroundColor:model.lookupCanvasColor(this.props.selectedColor)
        }}></button>
    }
}

class App extends React.Component {
    constructor(props) {
        super(props)
        this.state = {
            drawGrid:true,
            selectedColor:1
        };
        var self = this;
        this.state.pencil_tool = {
            mouseDown: function(surf, pt) {
                model.setData(pt,self.state.selectedColor);
            },
            mouseDrag: function(surf,pt) {
                model.setData(pt,self.state.selectedColor);
            },
            mouseUp:function(surf){
            }
        };
        this.state.eyedropper_tool = {
            mouseDown: function(surf,pt) {
                self.setState({
                    selectedColor:model.getData(pt)
                })
            },
            mouseDrag: function(surf,pt) {
                self.setState({
                    selectedColor:model.getData(pt)
                })
            },
            mouseUp: function() {

            }
        };
        this.state.selected_tool = this.state.pencil_tool;
    }

    toggleGrid() {
        this.setState({
            drawGrid: !this.state.drawGrid
        })
    }
    selectColor(color) {
        this.setState({selectedColor:color});
    }

    selectPencil() {
        this.setState({ selected_tool: this.state.pencil_tool});
    }

    selectEyedropper() {
        this.setState({ selected_tool: this.state.eyedropper_tool});
    }

    exportPNG() {
        ExportPNG(model);
    }

    render() {
        return <div className="hbox fill">
            <div className="vbox">
                <PopupButton caption="Color"><ColorPicker onSelectColor={this.selectColor.bind(this)}/></PopupButton>
                <ColorWellButton selectedColor={this.state.selectedColor}/>
                <ToggleButton onToggle={this.selectPencil.bind(this)} selected={this.state.selected_tool === this.state.pencil_tool}>pencil</ToggleButton>
                <ToggleButton onToggle={this.selectEyedropper.bind(this)} selected={this.state.selected_tool === this.state.eyedropper_tool}>eyedropper</ToggleButton>
                <button>eraser</button>
                <button>undo</button>
                <button>redo</button>
                <ToggleButton onToggle={this.toggleGrid.bind(this)} selected={this.state.drawGrid}>Grid</ToggleButton>
                <button onClick={this.exportPNG.bind(this)}>export</button>
            </div>
            <DrawingSurface tool={this.state.selected_tool} model={model} drawGrid={this.state.drawGrid}/>
            <LayersPanel/>
        </div>
    }
}



ReactDOM.render(<App/>, document.getElementsByTagName("body")[0]);