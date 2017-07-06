import React, {Component} from "react";
import DrawingSurface from "./DrawingSurface.jsx"
import LayersPanel from "./LayersPanel.jsx";
import DocStore from "./DocStore.js";
import UserStore from "./UserStore";
import Config from "./Config"
import BitmapModel from "./BitmapModel"
// import Dropdown from "./Dropdown.jsx"
import DropdownButton from "./DropdownButton.jsx"
import Button from "./Button.jsx";
import ColorPicker from "./ColorPicker.jsx";
import PopupState from "./PopupState.jsx";
import RecentColors from "./RecentColors.jsx";
import ToggleButton from "./ToggleButton.jsx"
import ColorWellButton from "./ColorWellButton.jsx";
import PreviewPanel from "./PreviewPanel.jsx"
// import ResizePanel from "./ResizePanel.jsx";
// import AlertPanel from "./AlertPanel.jsx";
import {VBox, HBox, Spacer} from "appy-comps";
import {KEYBOARD} from "./u";
import { PencilTool, EraserTool, MoveTool } from "./Tools.jsx";
import "font-awesome/css/font-awesome.css";
import "./web/components.css";
// import "appy-style/src/dialog.css";
import "appy-style/src/look.css";
// import "appy-style/src/layout.css";
const REQUIRE_AUTH = true;

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
    mouseUp() {
        this.app.selectPencil();
    }
    getOptionsPanel() {
        return <label>none</label>
    }
}


export default class App extends Component {
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
            showLayers:true,
            selectedColor:1,
            scale: 16,
            dirty:false
        };
        this.state.shiftLayerOnly = false;
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
        this.model_listener = this.props.doc.model.changed((mod)=> this.setState({model:mod, dirty:true}));
    }

    getModel() {
        return this.props.doc.model;
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
    toggleLayers() {
        this.setState({ showLayers: !this.state.showLayers})
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
    exportPNG(scale) {
        PopupState.done();
        this.saveDoc(function() {
            document.location.href = Config.url("/preview/")
                + DocStore.getDoc().id
                + "?download=true"
                + "&scale="+scale
                +"&"+Math.floor(Math.random()*100000);
        });
    }
    saveDoc(cb) {
        DocStore.save(DocStore.getDoc(), (res) => {
            DocStore.getDoc().id=res.id;
            if(typeof cb === 'function') cb();
            this.setState({dirty:false});
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
    drawStamp(pt, stamp, new_color) {
        var model = this.props.doc.model;
        var layer = model.getCurrentLayer();
        if(!layer) return;
        if(!model.isLayerVisible(layer)) return;
        model.drawStamp(pt,stamp);
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
        if(this.state.dirty) {
            this.refs.alert.show({
                text:'Document not saved!',
                okayText:'Discard Changes',
                cancelText:'Cancel',
                onCancel:()=> this.refs.alert.hide(),
                onOkay:()=> {
                    this.refs.alert.hide();
                    DocStore.loadDocList((docs)=>this.setState({doclist:docs, openVisible:true}));
                }
            });
        } else {
            DocStore.loadDocList((docs)=>this.setState({doclist:docs, openVisible:true}));
        }

    }
    openDocCanceled() {
        this.setState({openVisible:false})
    }
    openDocPerform(id) {
        this.setState({doclist:[], openVisible:false})
        DocStore.loadDoc(id);
        this.setState({dirty:false});
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
        if(this.state.dirty) {
            this.refs.alert.show({
                text:'Document not saved!',
                okayText:'Discard Changes',
                cancelText:'Cancel',
                onCancel:()=> this.refs.alert.hide(),
                onOkay:()=> {
                    this.refs.alert.hide();
                    this.setState({newVisible: true});
                }
            });
        } else {
            this.setState({newVisible: true});
        }
    }
    newDocCanceled() {
        this.setState({newVisible:false});
    }
    newDocPerformed(settings) {
        this.setState({newVisible:false});
        var doc = DocStore.newDoc();
        doc.model = new BitmapModel(settings.w,settings.h);
        doc.title = settings.title;
        DocStore.setDoc(doc);
        this.setState({ doc: doc});
    }

    resizeDoc() {
        this.refs.resizePanel.show();
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
    canvasKeyDown(e) {
        if(e.keyCode == KEYBOARD.E) {
            this.selectEraser();
        }
        if(e.keyCode == KEYBOARD.P) {
            this.selectPencil();
        }
        if(e.keyCode == KEYBOARD.I) {
            this.selectEyedropper();
        }
        if(e.keyCode == KEYBOARD.V) {
            this.selectMove();
        }
    }
    selectBGColor(color) {
        PopupState.done();
        this.props.doc.model.setBackgroundColor(color);
    }
    render() {
        var loggedOut = UserStore.getUser()==null;
        var model = this.props.doc.model;
        return (<HBox fill className="panel">
			<VBox className="panel left">
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
				<ToggleButton onToggle={this.togglePreview.bind(this)} selected={this.state.drawPreview} tooltip="Show/Hide Preview">Preview</ToggleButton>
				<label/>
				<Button onClick={this.newDoc.bind(this)}    disabled={loggedOut} tooltip="New Image"><i className="fa fa-file-o"/></Button>
				<Button onClick={this.saveDoc.bind(this)}   disabled={loggedOut} tooltip="Save Image"><i className="fa fa-save"/></Button>
				<Button onClick={this.openDoc.bind(this)}   disabled={loggedOut} tooltip="Open Image"><i className="fa fa-folder-open"/></Button>
				<Button onClick={this.resizeDoc.bind(this)} tooltip="Resize Doc">resize</Button>
				<ToggleButton onToggle={this.toggleLayers.bind(this)} selected={this.state.showLayers} tooltip="Show/Hide Layers">Layers</ToggleButton>
			</VBox>
			<VBox grow>
				<HBox className="panel top">
					<DropdownButton icon="gear" tooltip="Background color">
						<ColorPicker model={this.props.doc.model} onSelectColor={this.selectBGColor.bind(this)}/>
					</DropdownButton>
					<input type="text" ref="doc_title" value={this.props.doc.title} onChange={this.titleEdited.bind(this)}/>
                    <Spacer/>
					<Button onClick={this.zoomIn.bind(this)}><i className="fa fa-plus"/></Button>
					<Button onClick={this.zoomOut.bind(this)}><i className="fa fa-minus"/></Button>
					<DropdownButton icon="share" direction="left">
						<li className="disabled">Tweet</li>
						<li onClick={this.exportPNG.bind(this,1)}>Export as PNG 1x</li>
						<li onClick={this.exportPNG.bind(this,2)}>Export as PNG 2x</li>
						<li onClick={this.exportPNG.bind(this,4)}>Export as PNG 4x</li>
						<li onClick={this.exportPNG.bind(this,8)}>Export as PNG 8x</li>
						<li className="disabled">Export as JSON</li>
						<li onClick={this.openShare.bind(this)}>Get Sharing Link</li>
					</DropdownButton>
				</HBox>
				<HBox className="panel">
					<label><b>options</b></label>
                    {this.state.selected_tool.getOptionsPanel()}
				</HBox>
				<DrawingSurface
					tabIndex="1"
					tool={this.state.selected_tool} model={model} drawGrid={this.state.drawGrid} scale={this.state.scale}
					onKeyDown={this.canvasKeyDown.bind(this)}
				/>
				<RecentColors colors={this.state.recentColors} model={model} onSelectColor={this.selectColor.bind(this)}/>
				<HBox className="panel bottom">
					<button onClick={this.loginLogout.bind(this)}>{this.state.user?"logout":"login"}</button>
					<label>{this.state.user?this.state.user.username:'not logged in'}</label>
					<Spacer/>
					<label><i>{this.state.dirty?"unsaved changes":""}</i></label>
				</HBox>
			</VBox>
            {this.state.drawPreview?<VBox ><PreviewPanel model={model}/></VBox>:""}
			<VBox className="panel right">
                {this.state.showLayers?<LayersPanel model={model}/>:""}
			</VBox>

        </HBox>)
    }
}

/*

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

 <ResizePanel ref="resizePanel" model={model}/>
 <AlertPanel ref="alert"/>

 */