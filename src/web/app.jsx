require('./flexbox.css');
require('./components.css');

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
import BitmapModel from "./BitmapModel.js";
import ExportPNG from "./ExportPng";
import US from "./UserStore";
var UserStore = US.init();

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

class LoginPanel extends React.Component {
    tryLogin(e) {
        e.stopPropagation();
        var self = this;
        var data = {
            username: this.refs.username.value,
            password: this.refs.password.value
        };
        UserStore.login(data, function(user){
            self.props.onCompleted(user);
        });
    }
    render() {
        return <div className="fill" style={{ background:"white"}}>
            <form>
                <label>username</label><input type="text" ref="username"/><br/>
                <label>password</label><input type="text" ref="password"/><br/>
                <input type="button" onClick={this.tryLogin.bind(this)} value="login"/>
            </form>
        </div>
    }
}

class OpenDocPanel extends React.Component {
    loadDoc(id) {
        this.props.onSelectDoc(id);
    }
    renderDocs(docs) {
        var self = this;
        return docs.map((doc)=> {
            return <li key={doc.id}><button onClick={self.loadDoc.bind(self,doc.id)}>{doc.title}</button></li>
        });
    }
    render() {
        return <div className="fill" style={{ background:"white"}}>
            <ul>
                {this.renderDocs(this.props.docs)}
            </ul>
            <button onClick={this.props.onCancel}>Cancel</button>
        </div>
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

        this.state.command_buffer = [];
        this.state.command_index = 0;
        this.state.user = null;
        this.state.model = model;
        this.state.doc_title = "Untitled Artwork";
        this.state.doc_id = null;

        UserStore.checkLoggedIn((user) => this.setState({user:user}));
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
    saveDoc() {
        var doc = {
            model: this.state.model,
            id: this.state.doc_id,
            title: this.state.doc_title
        };
        DocStore.save(doc, (res) => this.setState({doc_id:res.id}));
    }
    setPixel(pt,new_color) {
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
        DocStore.loadDocList((docs)=>this.setState({doclist:docs}));
    }

    renderOpenDoc() {
        if(this.state.doclist) {
            return <OpenDocPanel
                docs={this.state.doclist}
                onCancel={this.openDocCanceled.bind(this)}
                onSelectDoc={this.openDocPerform.bind(this)}
            />
        }
        return "";
    }
    openDocCanceled() {
        this.setState({doclist:null})
    }
    openDocPerform(id) {
        this.setState({doclist:null})
        var self = this;
        DocStore.loadDoc(id,function(obj) {
            var m2 = BitmapModel.fromJSON(obj.doc.model);
            model = m2;
            self.setState({
                model:m2,
                doc_id:obj.doc.id,
                doc_title:obj.doc.title
            })
        });
    }
    newDoc() {
        model = new BitmapModel(16,16);
        this.setState({
            model:model,
            doc_title:"Untitled Artwork",
            doc_id:null
        })
    }
    renderLogin() {
        if(UserStore.getUser()) {
            return ""
        } else {
            return <LoginPanel onCompleted={this.onLoginCompleted.bind(this)}/>
        }
    }
    onLoginCompleted(user) {
        this.setState({user:user});
    }
    titleEdited() {
        this.setState({doc_title:this.refs.doc_title.value});
    }
    render() {
        return (<div className="hbox fill">
            <div className="vbox">
                <label>user = {this.state.user?this.state.user.username:'not logged in'}</label>
                <label></label>
                <PopupButton caption="Color"><ColorPicker onSelectColor={this.selectColor.bind(this)}/></PopupButton>
                <ColorWellButton selectedColor={this.state.selectedColor}/>
                <ToggleButton onToggle={this.selectPencil.bind(this)} selected={this.state.selected_tool === this.state.pencil_tool}>pencil</ToggleButton>
                <ToggleButton onToggle={this.selectEyedropper.bind(this)} selected={this.state.selected_tool === this.state.eyedropper_tool}>eyedropper</ToggleButton>
                <button>eraser</button>
                <label></label>
                <button onClick={this.execUndo.bind(this)} disabled={!this.isUndoAvailable()}>undo</button>
                <button onClick={this.execRedo.bind(this)} disabled={!this.isRedoAvailable()}>redo</button>
                <ToggleButton onToggle={this.toggleGrid.bind(this)} selected={this.state.drawGrid}>Grid</ToggleButton>
                <label></label>
                <button onClick={this.exportPNG.bind(this)}>export</button>
                <button onClick={this.newDoc.bind(this)}>new</button>
                <button onClick={this.saveDoc.bind(this)}>save</button>
                <button onClick={this.openDoc.bind(this)}>open</button>
            </div>
            <div className="vbox">
                <input type="text" ref="doc_title" value={this.state.doc_title} onChange={this.titleEdited.bind(this)}/>
                <DrawingSurface tool={this.state.selected_tool} model={model} drawGrid={this.state.drawGrid}/>
            </div>
            {this.renderLogin()}
            {this.renderOpenDoc()}
        </div>)
    }
}
//disable layers until we are ready for it           <LayersPanel/>



ReactDOM.render(<App/>, document.getElementsByTagName("body")[0]);