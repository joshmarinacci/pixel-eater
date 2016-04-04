require('./flexbox.css');
require('./components.css');
require('../../node_modules/font-awesome/css/font-awesome.css')

/*

get list of files
save current file
create a new file

 */
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
        var wells = DocStore.getModel().getPalette().map((c,i) => this.renderColorWell(c,i));
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

class ToggleButton extends React.Component {
    render() {
        var cls = '';
        if(this.props.selected === true)  cls += " selected";
        return <button className={cls} onClick={this.props.onToggle}>{this.props.children}</button>
    }
}

class ColorWellButton extends React.Component {
    clicked() {
        this.refs.popup.open();
    }
    render() {
        return (<button className="color-well "
                       style={{
                       backgroundColor:DocStore.getModel().lookupCanvasColor(this.props.selectedColor),
                       position:'relative'
                        }}
                        onClick={this.clicked.bind(this)}
        ><i className="fa fa-fw"></i><PopupContainer ref="popup">{this.props.children}</PopupContainer>
        </button>);
    }
}



class App extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            drawGrid:true,
            selectedColor:1
        };
        var self = this;
        this.state.pencil_tool = {
            mouseDown: function(surf, pt) {
                self.setPixel(pt,self.state.selectedColor);
            },
            mouseDrag: function(surf,pt) {
                self.setPixel(pt,self.state.selectedColor);
            },
            mouseUp:function(surf){
            },
            contextMenu: function(surf,pt) {
                self.setState({
                    selectedColor:DocStore.getModel().getData(pt)
                })
            }
        };
        this.state.eyedropper_tool = {
            mouseDown: function(surf,pt) {
                self.setState({
                    selectedColor:DocStore.getModel().getData(pt)
                })
            },
            mouseDrag: function(surf,pt) {
                self.setState({
                    selectedColor:DocStore.getModel().getData(pt)
                })
            },
            mouseUp: function() {

            }
        };
        this.state.selected_tool = this.state.pencil_tool;

        this.state.command_buffer = [];
        this.state.command_index = 0;
        this.state.user = null;
        this.state.doc = DocStore.getDoc();
        this.state.doclist = [];
        this.state.loginVisible = false;
        this.state.registerVisible = false;
        this.state.openVisible = false;

        UserStore.checkLoggedIn((user) => this.setState({user:user}));
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

    exportPNG() {
        ExportPNG(DocStore.getModel());
    }
    saveDoc() {
        DocStore.save(DocStore.getDoc(), (res) => DocStore.getDoc().id=res.id);
    }
    setPixel(pt,new_color) {
        var model = DocStore.getModel();
        var old_color = model.getData(pt);
        model.setData(pt,new_color);
        this.appendCommand(function() {
            model.setData(pt,old_color);
        }, function() {
            model.setData(pt,new_color);
        });
    }
    appendCommand(undo,redo) {
        var newbuff = this.state.command_buffer.slice(0,this.state.command_index);
        newbuff.push({undo:undo,redo:redo});
        this.setState({
            command_buffer:newbuff,
            command_index: this.state.command_index+1
        })
    }
    execUndo() {
        var cmd = this.state.command_buffer[this.state.command_index-1];
        cmd.undo();
        this.setState({
            command_index:this.state.command_index-1
        });
    }
    execRedo() {
        var cmd = this.state.command_buffer[this.state.command_index];
        cmd.redo();
        this.setState({
            command_index:this.state.command_index+1
        })
    }
    isUndoAvailable() {
        return this.state.command_index > 0;
    }
    isRedoAvailable() {
        return this.state.command_index < this.state.command_buffer.length;
    }

    openDoc() {
        DocStore.loadDocList((docs)=>this.setState({doclist:docs, openVisible:true}));
    }

    openDocCanceled() {
        this.setState({openVisible:false})
    }
    openDocPerform(id) {
        this.setState({doclist:[], openVisible:false})
        var self = this;
        DocStore.loadDoc(id,function(doc) {
            self.setState({
                //reset the undo buffer
                command_buffer:[],
                command_index: 0,
                //set the new doc
                doc: doc
            })
        });
    }
    newDoc() {
        DocStore.setDoc(DocStore.newDoc());
            this.setState({
            //reset the undo buffer
            command_buffer:[],
            command_index: 0,
            //set the new doc
            doc: DocStore.getDoc()
        });
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
        return (<div className="hbox fill">
            <div className="vbox panel left">
                <label></label>
                <ColorWellButton selectedColor={this.state.selectedColor}><ColorPicker onSelectColor={this.selectColor.bind(this)}/></ColorWellButton>
                <ToggleButton onToggle={this.selectPencil.bind(this)} selected={this.state.selected_tool === this.state.pencil_tool}><i className="fa fa-pencil"></i></ToggleButton>
                <ToggleButton onToggle={this.selectEyedropper.bind(this)} selected={this.state.selected_tool === this.state.eyedropper_tool}><i className="fa fa-eyedropper"></i></ToggleButton>
                <button className="fa fa-eraser"></button>
                <label></label>
                <button onClick={this.execUndo.bind(this)} disabled={!this.isUndoAvailable()} className="fa fa-undo"></button>
                <button onClick={this.execRedo.bind(this)} disabled={!this.isRedoAvailable()} className="fa fa-repeat"></button>
                <ToggleButton onToggle={this.toggleGrid.bind(this)} selected={this.state.drawGrid}><i className="fa fa-th"></i></ToggleButton>
                <label></label>
                <button onClick={this.exportPNG.bind(this)} className="fa fa-download"></button>
                <button onClick={this.newDoc.bind(this)}    disabled={loggedOut} className="fa fa-file-o"></button>
                <button onClick={this.saveDoc.bind(this)}   disabled={loggedOut} className="fa fa-save"></button>
                <button onClick={this.openDoc.bind(this)}   disabled={loggedOut} className="fa fa-folder-open"></button>
            </div>
            <div className="vbox grow">
                <div className="panel top">
                    <input type="text" ref="doc_title" value={this.state.doc.title} onChange={this.titleEdited.bind(this)}/>
                </div>
                <DrawingSurface tool={this.state.selected_tool} model={DocStore.getModel()} drawGrid={this.state.drawGrid}/>
                <div className="panel bottom">
                    <button onClick={this.loginLogout.bind(this)}>{this.state.user?"logout":"login"}</button>
                    <label>{this.state.user?this.state.user.username:'not logged in'}</label>
                </div>
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
//disable layers until we are ready for it           <LayersPanel/>
/*
 <div className="vbox panel right">
 <LayersPanel/>
 </div>

 */

ReactDOM.render(<App/>, document.getElementsByTagName("body")[0]);