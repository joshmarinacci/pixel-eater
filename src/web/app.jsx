require('./flexbox.css');
require('./components.css');
require('../../node_modules/font-awesome/css/font-awesome.css')

import React from "react";
import ReactDOM from "react-dom";
import DrawingSurface from "./DrawingSurface.jsx"
import LayersPanel from "./LayersPanel.jsx";
import DocStore from "./DocStore.js";
import Dialog from "./Dialog.jsx";
import ExportPNG from "./ExportPng";
import UserStore from "./UserStore";
import LoginPanel from "./LoginPanel.jsx"
import RegistrationPanel from "./RegistrationPanel.jsx";
import OpenDocPanel from "./OpenDocPanel.jsx";
import NewDocPanel from "./NewDocPanel.jsx";
import SharePanel from "./SharePanel.jsx"
import Config from "./Config"
import BitmapModel from "./BitmapModel"
import Dropdown from "./Dropdown.jsx"
import DropdownButton from "./DropdownButton.jsx"
import Button from "./Button.jsx";
import ColorPicker from "./ColorPicker.jsx";
import PopupState from "./PopupState.jsx";
import RecentColors from "./RecentColors.jsx";
import ToggleButton from "./controls/ToggleButton.jsx"
import ColorWellButton from "./controls/ColorWellButton.jsx";

var REQUIRE_AUTH = true;


class PencilTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf, pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        this.app.setPixel(pt,this.app.state.selectedColor);
    }
    mouseUp(surf){}
    contextMenu(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
}

class EyedropperTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf,pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        this.app.selectColor(DocStore.getDoc().model.getData(pt));
    }
    mouseUp() {}
}

class EraserTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf,pt) {
        this.mouseDrag(surf,pt);
    }
    mouseDrag(surf,pt) {
        this.app.setPixel(pt, -1);
    }
    mouseUp() {}
}

class MoveTool {
    constructor(app) {
        this.app = app;
    }
    mouseDown(surf,pt) {
        this.prev = pt;
    }
    mouseDrag(surf,pt) {
        var diff = {
            x: pt.x - this.prev.x,
            y: pt.y - this.prev.y
        };
        this.app.shiftLayers(diff);
        this.prev = pt;
    }
    mouseUp() {}
}

class PreviewPanel extends React.Component {
    componentDidMount() {
        this.drawCanvas();
    }
    componentWillReceiveProps(props) {
        setTimeout(this.drawCanvas.bind(this),0);
    }
    shouldComponentUpdate() {
        return false;
    }
    drawCanvas() {
        let c = this.refs.canvas.getContext('2d');
        var w = this.props.model.getWidth();
        this.drawScaled(c,0,w*0,w,1);
        this.drawScaled(c,0,w*1,w,2);
        this.drawScaled(c,0,w*3,w,4);
        this.drawScaled(c,0,w*7,w,8);
        this.drawScaled(c,0,w*15,w,16);
    }
    drawScaled(c,ox,oy,w,s) {
        c.save();
        c.translate(ox,oy);
        c.fillStyle = 'white';
        c.fillRect(0,0,w*s,w*s);
        c.strokeStyle = 'black';
        c.strokeRect(0+0.5,0.5,w*s,w*s);
        this.props.model.getReverseLayers().map((layer) => this.drawLayer(c, layer,s, this.props.model));
        c.restore();
    }
    drawLayer(c,layer,sc, model) {
        if(!layer.visible) return;
        c.save();
        c.globalAlpha = layer.opacity;
        var w = model.getWidth();
        var h = model.getHeight();
        for(let y=0; y<h; y++) {
            for (let x = 0; x < w; x++) {
                var val = this.props.model.getPixelFromLayer(x,y,layer);
                if(val == -1) continue;
                c.fillStyle = this.props.model.lookupCanvasColor(val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }
        c.restore();
    }
    render() {
        return <div className="grow scroll">
            <canvas ref="canvas" width={16*16+1} height={16*31+1}/>
        </div>
    }
}

class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.doc = DocStore.getDoc();
        DocStore.changed(()=>this.setState({doc:DocStore.getDoc()}));
    }
    render() {
        return <div><DocPanel doc={this.state.doc}/></div>
    }
}

class DocPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawGrid:true,
            drawPreview:false,
            selectedColor:1,
            scale: 16
        };
        this.state.pencil_tool = new PencilTool(this);
        this.state.eyedropper_tool = new EyedropperTool(this);
        this.state.eraser_tool = new EraserTool(this);
        this.state.move_tool = new MoveTool(this);
        this.state.selected_tool = this.state.pencil_tool;
        this.state.user = null;
        this.state.doclist = [];
        this.state.loginVisible = false;
        this.state.registerVisible = false;
        this.state.openVisible = false;
        this.state.shareVisible = false;
        this.state.newVisible = false;
        this.state.recentColors = [];

        UserStore.checkLoggedIn((user) => this.setState({user:user}));
        this.model_listener = this.props.doc.model.changed((mod)=> this.setState({model:mod}));
    }

    componentWillReceiveProps(nextProps) {
        this.props.doc.model.unlisten(this.model_listener);
        this.model_listener = nextProps.doc.model.changed((mod)=>this.setState({model:mod}));
    }
    toggleGrid() {
        this.setState({ drawGrid: !this.state.drawGrid })
    }
    togglePreview() {
        this.setState({ drawPreview: !this.state.drawPreview})
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
    selectEraser() {
        this.setState({ selected_tool: this.state.eraser_tool});
    }
    selectMove() {
        this.setState({ selected_tool: this.state.move_tool});
    }
    exportPNG() {
        this.refs.sharePopup.close();
        this.saveDoc(function() {
            document.location.href = Config.url("/preview/")
                + DocStore.getDoc().id
                + "?download=true&"+Math.floor(Math.random()*100000);
        });
    }
    saveDoc(cb) {
        DocStore.save(DocStore.getDoc(), (res) => {
            DocStore.getDoc().id=res.id;
            if(typeof cb == 'function') cb();
        });
    }
    setPixel(pt,new_color) {
        var model = this.props.doc.model;
        var layer = model.getCurrentLayer();
        if(!layer) return;
        if(!model.isLayerVisible(layer)) return;
        model.setPixel(pt,new_color);
        this.appendRecentColor(new_color);
    }
    shiftLayers(pt) {
        this.props.doc.model.shiftLayers(pt);
    }
    appendRecentColor(color) {
        var n = this.state.recentColors.indexOf(color);
        if(n < 0) {
            this.state.recentColors.push(color);
            this.setState({
                recentColors:this.state.recentColors
            })
        }
    }
    execUndo() {
        this.props.doc.model.execUndo();
    }
    execRedo() {
        this.props.doc.model.execRedo();
    }

    openDoc() {
        DocStore.loadDocList((docs)=>this.setState({doclist:docs, openVisible:true}));
    }
    openDocCanceled() {
        this.setState({openVisible:false})
    }
    openDocPerform(id) {
        this.setState({doclist:[], openVisible:false})
        DocStore.loadDoc(id);
    }

    openShare() {
        this.setState({shareVisible:true});
    }
    openShareCanceled() {
        this.setState({shareVisible:false});
    }

    deleteDoc(id) {
        DocStore.deleteDoc(id, function(err,status) {
            console.log("result is",err,status);
        });
    }

    newDoc() {
        this.setState({newVisible:true});
    }
    newDocCanceled() {
        this.setState({newVisible:false});
    }
    newDocPerformed(settings) {
        this.setState({newVisible:false});
        var doc = DocStore.newDoc();
        doc.model = new BitmapModel(settings.w,settings.h);
        DocStore.setDoc(doc);
        this.setState({ doc: doc});
    }

    onLoginCompleted(user) {
        this.setState({user:user, loginVisible:false});
    }
    onLoginCanceled() {
        this.setState({loginVisible:false});
    }
    onRegistrationCompleted(user) {
        this.setState({user:user, registerVisible:false});
    }
    onRegistrationCanceled() {
        this.setState({ registerVisible:false});
    }
    titleEdited() {
        DocStore.getDoc().title = this.refs.doc_title.value;
        this.setState({doc:DocStore.getDoc()});
    }
    loginLogout() {
        if(!this.state.user) {
            this.setState({loginVisible:true});
        } else {
            var self = this;
            UserStore.logout(function() {
                self.setState({user:null});
            });
        }
    }
    switchToRegister() {
        this.setState({
            loginVisible:false,
            registerVisible:true
        })
    }
    switchToLogin() {
        this.setState({
            loginVisible:true,
            registerVisible:false
        })
    }
    zoomIn() {
        this.setState({scale: this.state.scale<<1});
    }
    zoomOut() {
        this.setState({scale: this.state.scale>>1});
    }
    render() {
        var loggedOut = UserStore.getUser()==null;
        var model = this.props.doc.model;
        return (<div className="hbox fill">
            <div className="vbox panel left">
                <ColorWellButton model={model} selectedColor={this.state.selectedColor}>
                    <ColorPicker model={model} onSelectColor={this.selectColor.bind(this)}/>
                </ColorWellButton>
                <ToggleButton onToggle={this.selectPencil.bind(this)} selected={this.state.selected_tool === this.state.pencil_tool} tooltip="Pencil"><i className="fa fa-pencil"></i></ToggleButton>
                <ToggleButton onToggle={this.selectEyedropper.bind(this)} selected={this.state.selected_tool === this.state.eyedropper_tool} tooltip="Eyedropper"><i className="fa fa-eyedropper"></i></ToggleButton>
                <ToggleButton onToggle={this.selectEraser.bind(this)} selected={this.state.selected_tool === this.state.eraser_tool} tooltip="Eraser"><i className="fa fa-eraser"></i></ToggleButton>
                <ToggleButton onToggle={this.selectMove.bind(this)} selected={this.state.selected_tool === this.state.move_tool} tooltip="Move Layer(s)"><i className="fa fa-arrows"></i></ToggleButton>
                <label/>
                <Button onClick={this.execUndo.bind(this)} disabled={!model.isUndoAvailable()} tooltip="Undo"><i className="fa fa-undo"/></Button>
                <Button onClick={this.execRedo.bind(this)} disabled={!model.isRedoAvailable()} tooltip="Redo"><i className="fa fa-repeat"/></Button>
                <ToggleButton onToggle={this.toggleGrid.bind(this)} selected={this.state.drawGrid} tooltip="Show/Hide Grid"><i className="fa fa-th"/></ToggleButton>
                <ToggleButton onToggle={this.togglePreview.bind(this)} selected={this.state.drawPreview} tooltip="Show/Hide Preview"><i className="fa fa-image"/></ToggleButton>
                <label/>
                <Button onClick={this.newDoc.bind(this)}    disabled={loggedOut} tooltip="New Image"><i className="fa fa-file-o"/></Button>
                <Button onClick={this.saveDoc.bind(this)}   disabled={loggedOut} tooltip="Save Image"><i className="fa fa-save"/></Button>
                <Button onClick={this.openDoc.bind(this)}   disabled={loggedOut} tooltip="Open Image"><i className="fa fa-folder-open"/></Button>
            </div>
            <div className="vbox grow">
                <div className="panel hbox top">
                    <input type="text" ref="doc_title" value={this.props.doc.title} onChange={this.titleEdited.bind(this)}/>
                    <label className="grow"></label>
                    <Button onClick={this.zoomIn.bind(this)}>+</Button>
                    <Button onClick={this.zoomOut.bind(this)}>-</Button>
                    <DropdownButton icon="share" ref="sharePopup">
                        <li className="disabled">Tweet</li>
                        <li onClick={this.exportPNG.bind(this)}>Export as PNG</li>
                        <li className="disabled">Export as JSON</li>
                        <li onClick={this.openShare.bind(this)}>Get Sharing Link</li>
                    </DropdownButton>
                </div>
                <DrawingSurface tool={this.state.selected_tool} model={model} drawGrid={this.state.drawGrid} scale={this.state.scale}/>
                <RecentColors colors={this.state.recentColors} model={model} onSelectColor={this.selectColor.bind(this)}/>
                <div className="panel bottom">
                    <button onClick={this.loginLogout.bind(this)}>{this.state.user?"logout":"login"}</button>
                    <label>{this.state.user?this.state.user.username:'not logged in'}</label>
                </div>
            </div>
            {this.state.drawPreview?<div className="vbox panel right"><PreviewPanel model={model}/></div>:""}
            <div className="vbox panel right">
                <LayersPanel model={model}/>
            </div>

            <LoginPanel
                visible={this.state.loginVisible}
                onCompleted={this.onLoginCompleted.bind(this)}
                onCanceled={this.onLoginCanceled.bind(this)}
                switchToRegister={this.switchToRegister.bind(this)}
            />
            <RegistrationPanel
                visible={this.state.registerVisible}
                onCompleted={this.onRegistrationCompleted.bind(this)}
                onCanceled={this.onRegistrationCanceled.bind(this)}
                switchToRegister={this.switchToLogin.bind(this)}
            />

            <OpenDocPanel
                visible={this.state.openVisible}
                docs={this.state.doclist}
                onSelectDoc={this.openDocPerform.bind(this)}
                onCanceled={this.openDocCanceled.bind(this)}
                onDeleteDoc={this.deleteDoc.bind(this)}
            />

            <NewDocPanel
                visible={this.state.newVisible}
                onCancel={this.newDocCanceled.bind(this)}
                onOkay={this.newDocPerformed.bind(this)}
            />

            <SharePanel
                visible={this.state.shareVisible}
                onCanceled={this.openShareCanceled.bind(this)}
                id={DocStore.getDoc().id}
            />

        </div>)
    }
}

ReactDOM.render(<App/>, document.getElementsByTagName("body")[0]);