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
import Config from "./Config"


var REQUIRE_AUTH = true;



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
        var wells = this.props.model.getPalette().map((c,i) => this.renderColorWell(c,i));
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
    clicked() {
        this.refs.popup.open();
    }
    render() {
        return <button style={{ position: 'relative' }} onClick={this.clicked.bind(this)}>
            {this.props.caption}
            <PopupContainer ref="popup">{this.props.children}</PopupContainer>
        </button>
    }
}

class PopupContainer extends React.Component {
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
    open() {
        this.setState({
            open:true
        })
    }
    render() {
        return <div style={{
                    position: 'absolute',
                    left:'100%',
                    top:0,
                    border: "1px solid red",
                    backgroundColor:'white',
                    padding:'1em',
                    borderRadius:'0.5em',
                    display:this.state.open?'block':'none'
                    }}
        >{this.props.children}
            </div>
    }
}

class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverVisible:false
        }
    }
    mouseOver() {
        this.timeout = setTimeout(this.onHover.bind(this),1000);
    }
    mouseOut() {
        clearTimeout(this.timeout);
        this.setState({hoverVisible:false});
    }
    onHover() {
        this.setState({hoverVisible:true});
    }
    renderHover() {
        var hover = "";
        if(this.state.hoverVisible) {
            hover = <p className="tooltip">{this.props.tooltip}</p>
        }
        return hover;
    }
    onClick() {
        if(this.props.onClick) {
            this.props.onClick();
        } else {
            console.log("no click defined");
        }
    }
    generateStyle() {
        return "tooltip-button";
    }
    render() {
        var hover = this.renderHover();
        var cls = this.generateStyle();
        return <button className={cls}
                       onMouseOver={this.mouseOver.bind(this)}
                       onMouseOut={this.mouseOut.bind(this)}
                       onClick={this.onClick.bind(this)}
            {...this.props}
        >{this.props.children}{hover}</button>
    }
}

class ToggleButton extends Button {
    onClick() {
        if(this.props.onToggle) {
            this.props.onToggle();
        } else {
            super.onClick();
        }
    }
    generateStyle() {
        var cls = super.generateStyle();
        if(this.props.selected === true)  cls += " selected";
        return cls;
    }
}

class ColorWellButton extends React.Component {
    clicked() {
        this.refs.popup.open();
    }
    render() {
        return (<button className="color-well "
                       style={{
                       backgroundColor:this.props.model.lookupCanvasColor(this.props.selectedColor),
                       position:'relative'
                        }}
                        onClick={this.clicked.bind(this)}
        ><i className="fa fa-fw"></i><PopupContainer ref="popup">{this.props.children}</PopupContainer>
        </button>);
    }
}

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
            selectedColor:1
        };
        this.state.pencil_tool = new PencilTool(this);
        this.state.eyedropper_tool = new EyedropperTool(this);
        this.state.eraser_tool = new EraserTool(this);
        this.state.selected_tool = this.state.pencil_tool;
        this.state.user = null;
        this.state.doclist = [];
        this.state.loginVisible = false;
        this.state.registerVisible = false;
        this.state.openVisible = false;

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
    exportPNG() {
        this.saveDoc(function() {
            document.location.href = Config.url("/preview/")+ DocStore.getDoc().id;
        });
    }
    saveDoc(cb) {
        DocStore.save(DocStore.getDoc(), (res) => {
            DocStore.getDoc().id=res.id;
            if(cb)cb();
        });
    }
    setPixel(pt,new_color) {
        this.props.doc.model.setPixel(pt,new_color);
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
    newDoc() {
        DocStore.setDoc(DocStore.newDoc());
        this.setState({ doc: DocStore.getDoc()});
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
                <label/>
                <Button onClick={this.execUndo.bind(this)} disabled={!model.isUndoAvailable()} tooltip="Undo"><i className="fa fa-undo"/></Button>
                <Button onClick={this.execRedo.bind(this)} disabled={!model.isRedoAvailable()} tooltip="Redo"><i className="fa fa-repeat"/></Button>
                <ToggleButton onToggle={this.toggleGrid.bind(this)} selected={this.state.drawGrid} tooltip="Show/Hide Grid"><i className="fa fa-th"/></ToggleButton>
                <label/>
                <Button onClick={this.exportPNG.bind(this)} tooltip="Export as PNG"><i className="fa fa-download"/></Button>
                <Button onClick={this.newDoc.bind(this)}    disabled={loggedOut} tooltip="New Image"><i className="fa fa-file-o"/></Button>
                <Button onClick={this.saveDoc.bind(this)}   disabled={loggedOut} tooltip="Save Image"><i className="fa fa-save"/></Button>
                <Button onClick={this.openDoc.bind(this)}   disabled={loggedOut} tooltip="Open Image"><i className="fa fa-folder-open"/></Button>
            </div>
            <div className="vbox grow">
                <div className="panel top">
                    <input type="text" ref="doc_title" value={this.props.doc.title} onChange={this.titleEdited.bind(this)}/>
                </div>
                <DrawingSurface tool={this.state.selected_tool} model={model} drawGrid={this.state.drawGrid}/>
                <div className="panel bottom">
                    <button onClick={this.loginLogout.bind(this)}>{this.state.user?"logout":"login"}</button>
                    <label>{this.state.user?this.state.user.username:'not logged in'}</label>
                </div>
            </div>
            <div className="vbox panel right">
                <LayersPanel model={model}/>
            </div>

            <Dialog visible={this.state.loginVisible}>
                <header>Login</header>
                <LoginPanel
                    onCompleted={this.onLoginCompleted.bind(this)}
                    onCanceled={this.onLoginCanceled.bind(this)}
                    switchToRegister={this.switchToRegister.bind(this)}
                />
            </Dialog>
            <Dialog visible={this.state.registerVisible}>
                <header>Register</header>
                <RegistrationPanel
                    onCompleted={this.onRegistrationCompleted.bind(this)}
                    onCanceled={this.onRegistrationCanceled.bind(this)}
                    switchToRegister={this.switchToLogin.bind(this)}
                />
            </Dialog>
            <Dialog visible={this.state.openVisible}>
                <header>Open</header>
                <OpenDocPanel
                    docs={this.state.doclist}
                    onSelectDoc={this.openDocPerform.bind(this)}
                />
                <footer><button onClick={this.openDocCanceled.bind(this)}>cancel</button></footer>
            </Dialog>
        </div>)
    }
}

ReactDOM.render(<App/>, document.getElementsByTagName("body")[0]);