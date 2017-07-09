import React, {Component} from "react";
import DrawingSurface from "./DrawingSurface.jsx"
import LayersPanel from "./LayersPanel.jsx";
import DocStore from "./DocStore.js";
import UserStore from "./UserStore";
import Config from "./Config"
import BitmapModel from "./BitmapModel"
import Button from "./Button.jsx";
import ColorPicker from "./ColorPicker.jsx";
import PopupState from "./PopupState.jsx";
import RecentColors from "./RecentColors.jsx";
import ToggleButton from "./ToggleButton.jsx"
import ColorWellButton from "./ColorWellButton.jsx";
import PreviewPanel from "./PreviewPanel.jsx"
import ResizePanel from "./ResizePanel.jsx";
import AlertPanel from "./AlertPanel.jsx";
import NewDocPanel from "./NewDocPanel";
import OpenDocPanel from "./OpenDocPanel";
import SharePanel from "./SharePanel";
import LoginPanel from "./LoginPanel";
import RegistrationPanel from "./RegistrationPanel";
import {VBox, HBox, Spacer, PopupContainer, VToggleGroup, PopupManager, DialogManager, DialogContainer} from "appy-comps";
import {KEYBOARD} from "./u";
import { PencilTool, EraserTool, MoveTool, EyedropperTool } from "./Tools";
import "font-awesome/css/font-awesome.css";
import "./web/components.css";
import "appy-style/src/look.css";



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

const ToggleButtonTemplate = (props) => {
    return <ToggleButton onToggle={props.onSelect}
                         selected={props.selected}
                         tooltip={props.item.tooltip}
    ><i className={"fa fa-"+props.item.icon}></i></ToggleButton>
};

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

        this.tools = [
            {
                tool: new PencilTool(this),
                tooltip:'Pencil',
                icon:'pencil',
                keyCode: KEYBOARD.P
            },
            {
                tool: new EraserTool(this),
                tooltip:'Eraser',
                icon:'eraser',
                keyCode: KEYBOARD.E
            },
            {
                tool: new EyedropperTool(this),
                tooltip:'Eyedropper',
                icon:'eyedropper',
                keyCode: KEYBOARD.I
            },
            {
                tool: new MoveTool(this),
                tooltip:'Move Layer(s)',
                icon:'arrows',
                keyCode: KEYBOARD.V
            },
        ];

        this.state.selected_tool = this.tools[0];
        this.selectTool = (item) => this.setState({selected_tool:item});

        this.state.user = null;
        this.state.doclist = [];
        this.state.recentColors = [];

        UserStore.checkLoggedIn()
            .then((user) => this.setState({user:user}))
            .catch((e)=>console.log("not logged in"));
        this.model_listener = this.props.doc.model.changed((mod)=> this.setState({model:mod, dirty:true}));



        this.loginLogout  = () => {
            if(!this.state.user) {
                DialogManager.show(<LoginPanel
                    onCompleted={this.onLoginCompleted}
                    onCanceled={this.onLoginCanceled}
                    switchToRegister={this.switchToRegister}
                />);
            } else {
                UserStore.logout(() => this.setState({user:null}));
            }
        };

        this.toggleGrid = () => this.setState({drawGrid: !this.state.drawGrid});
        this.togglePreview = () => this.setState({ drawPreview: !this.state.drawPreview});
        this.toggleLayers = () => this.setState({ showLayers: !this.state.showLayers});
        this.zoomIn = () => this.setState({scale: this.state.scale<<1});
        this.zoomOut = () => this.setState({scale: this.state.scale>>1});
        this.resizeDoc = () => DialogManager.show(<ResizePanel model={this.props.doc.model}/>);

        this.execUndo = () => this.props.doc.model.execUndo();
        this.execRedo = () => this.props.doc.model.execRedo();

        this.showError = (txt) => {
            DialogManager.show(<AlertPanel
                text={txt}
                okayText="Okay"
                onOkay={()=> DialogManager.hide()}
                />);
        };

        this.listDocs = () => {
            DialogManager.hide();
            DocStore.loadDocList().then((docs)=>{
                this.setState({doclist:docs});
                DialogManager.show(<OpenDocPanel
                    docs={docs}
                    onSelectDoc={this.openDocPerform}
                    onCanceled={this.openDocCanceled}
                    onDeleteDoc={this.deleteDoc}
                />);
            }).catch((e)=>{
                console.log("got an error");
                this.showError('some error happened');
            });
        };

        this.openDoc = () => {
            if(this.state.dirty) {
                DialogManager.show(<AlertPanel
                    text="Document not saved!"
                    okayText="Discard Changes"
                    cancelText="Cancel"
                    onCancel={()=>DialogManager.hide()}
                    onOkay={this.listDocs}
                />);
            } else {
                this.listDocs();
            }
        };
        this.openDocCanceled = () => DialogManager.hide();
        this.openDocPerform = (id) => {
            this.setState({doclist:[], dirty:false});
            DocStore.loadDoc(id);
        };


        this.onLoginCompleted = (user) => {
            DialogManager.hide();
            this.setState({user:user});
        };
        this.onLoginCanceled = () => DialogManager.hide();
        this.onRegistrationCompleted = (user)  => {
            DialogManager.hide();
            this.setState({user:user});
        };
        this.onRegistrationCanceled = () => DialogManager.hide();
        this.switchToRegister = () => {
            DialogManager.hide();
            DialogManager.show(<RegistrationPanel
                onCompleted={this.onRegistrationCompleted}
                onCanceled={this.onRegistrationCanceled}
                switchToRegister={this.switchToLogin}
            />);
        };
        this.switchToLogin = () => {
            DialogManager.hide();
            DialogManager.show(<LoginPanel
                onCompleted={this.onLoginCompleted}
                onCanceled={this.onLoginCanceled}
                switchToRegister={this.switchToRegister}
            />);
        };

        this.newDoc = () => {
            if(this.state.dirty) {
                DialogManager.show(<AlertPanel
                    text="Document not saved!"
                    okayText="Discard Changes"
                    cancelText="Cancel"
                    onCancel={()=>DialogManager.hide()}
                    onOkay={()=>{
                        DialogManager.hide();
                        this.showNewDocDialog();
                    }}
                />);
            } else {
                this.showNewDocDialog();
            }
        };
        this.showNewDocDialog = () => {
            DialogManager.show(<NewDocPanel
                onCancel={this.newDocCanceled}
                onOkay={this.newDocPerformed}
            />);
        };

        this.newDocPerformed = (settings) => {
            DialogManager.hide();
            var doc = DocStore.newDoc();
            doc.model = new BitmapModel(settings.w,settings.h);
            doc.title = settings.title;
            DocStore.setDoc(doc);
            this.setState({ doc: doc});
        };
        this.newDocCanceled = () => DialogManager.hide();

        this.saveDoc = (cb) => {
            DocStore.save(DocStore.getDoc(), (res) => {
                DocStore.getDoc().id=res.id;
                if(typeof cb === 'function') cb();
                this.setState({dirty:false});
            });
        };


        this.openShare = () => DialogManager.show(<SharePanel id={DocStore.getDoc().id}/>);
        this.openShareCanceled = () => DialogManager.hide();

        this.deleteDoc = (id) => {
            DocStore.deleteDoc(id, (err,status) => console.log("result of delete is",err,status));
        };

        this.selectBGColor = (color) => {
            PopupState.done();
            this.props.doc.model.setBackgroundColor(color);
        };
        this.selectColor = (color) => this.setState({selectedColor:color});
    }

    getModel() {
        return this.props.doc.model;
    }

    componentWillReceiveProps(nextProps) {
        this.props.doc.model.unlisten(this.model_listener);
        this.model_listener = nextProps.doc.model.changed((mod)=>this.setState({model:mod}));
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

    titleEdited() {
        DocStore.getDoc().title = this.refs.doc_title.value;
        this.setState({doc:DocStore.getDoc()});
    }
    canvasKeyDown(e) {
        let tool = this.tools.find((tool) => e.keyCode === tool.keyCode);
        if(tool) this.selectTool(tool);
    }

    renderSideToolbar() {
        let model = this.props.doc.model;
        var loggedOut = UserStore.getUser()===null;
        let cp =  <ColorPicker model={model} onSelectColor={this.selectColor}/>;
        return <VBox className="panel left">
            <ColorWellButton model={model} selectedColor={this.state.selectedColor} content={cp}/>
            <VToggleGroup list={this.tools} selected={this.state.selected_tool} template={ToggleButtonTemplate} onChange={this.selectTool}/>
            <Spacer/>
            <Button onClick={this.execUndo} disabled={!model.isUndoAvailable()} tooltip="Undo"><i className="fa fa-undo"/></Button>
            <Button onClick={this.execRedo} disabled={!model.isRedoAvailable()} tooltip="Redo"><i className="fa fa-repeat"/></Button>
            <Button onClick={this.resizeDoc} tooltip="Resize Doc">resize</Button>
            <ToggleButton onToggle={this.toggleGrid} selected={this.state.drawGrid} tooltip="Show/Hide Grid"><i className="fa fa-th"/></ToggleButton>
            <ToggleButton onToggle={this.togglePreview} selected={this.state.drawPreview} tooltip="Show/Hide Preview">Preview</ToggleButton>
            <ToggleButton onToggle={this.toggleLayers} selected={this.state.showLayers} tooltip="Show/Hide Layers">Layers</ToggleButton>
            <Spacer/>
            <Button onClick={this.newDoc}    disabled={loggedOut} tooltip="New Image"><i className="fa fa-file-o"/></Button>
            <Button onClick={this.saveDoc}   disabled={loggedOut} tooltip="Save Image"><i className="fa fa-save"/></Button>
            <Button onClick={this.openDoc}   disabled={loggedOut} tooltip="Open Image"><i className="fa fa-folder-open"/></Button>
        </VBox>
    }
    renderTopToolbar() {
        let cp2 = <ColorPicker model={this.props.doc.model} onSelectColor={this.selectBGColor}/>
        let sharePopup = <div>
            <li className="disabled">Tweet</li>
            <li onClick={this.exportPNG.bind(this,1)}>Export as PNG 1x</li>
            <li onClick={this.exportPNG.bind(this,2)}>Export as PNG 2x</li>
            <li onClick={this.exportPNG.bind(this,4)}>Export as PNG 4x</li>
            <li onClick={this.exportPNG.bind(this,8)}>Export as PNG 8x</li>
            <li className="disabled">Export as JSON</li>
            <li onClick={this.openShare}>Get Sharing Link</li>
        </div>;
        return <HBox className="panel top">
            <button onClick={(e)=>PopupManager.show(cp2,e.target)} className="fa fa-gear"/>
            <input type="text" ref="doc_title" value={this.props.doc.title} onChange={this.titleEdited.bind(this)}/>
            <Spacer/>
            <Button onClick={this.zoomIn}><i className="fa fa-plus"/></Button>
            <Button onClick={this.zoomOut}><i className="fa fa-minus"/></Button>
            <button onClick={(e)=>PopupManager.show(sharePopup, e.target)} className="fa fa-share"/>
            <button onClick={this.openShare}>share</button>
        </HBox>
    }
    renderBottomToolbar() {
        return <HBox className="panel bottom">
            <button onClick={this.loginLogout}>{this.state.user?"logout":"login"}</button>
            <label>{this.state.user?this.state.user.username:'not logged in'}</label>
            <Spacer/>
            <label><i>{this.state.dirty?"unsaved changes":""}</i></label>
        </HBox>
    }
    renderPreviewPanel() {
        return this.state.drawPreview?<VBox className="panel right"><PreviewPanel model={this.props.doc.model}/></VBox>:"";
    }
    renderLayersPanel() {
        return <VBox className="panel right">
            {this.state.showLayers?<LayersPanel model={this.props.doc.model}/>:""}
        </VBox>
    }
    render() {
        var model = this.props.doc.model;
        return (<HBox fill className="panel">
            {this.renderSideToolbar()}
			<VBox grow>
                {this.renderTopToolbar()}
				<HBox className="panel top">
					<label><b>options</b></label>
                    {this.state.selected_tool.tool.getOptionsPanel()}
				</HBox>
				<DrawingSurface
					tabIndex="1"
					tool={this.state.selected_tool.tool} model={model} drawGrid={this.state.drawGrid} scale={this.state.scale}
					onKeyDown={this.canvasKeyDown.bind(this)}
				/>
				<RecentColors colors={this.state.recentColors} model={model} onSelectColor={this.selectColor}/>
                {this.renderBottomToolbar()}
			</VBox>
            {this.renderPreviewPanel()}
            {this.renderLayersPanel()}
            <DialogContainer/>
            <PopupContainer/>
        </HBox>)
    }
}
