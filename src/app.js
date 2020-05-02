import React, {Component} from "react";
import {VBox, HBox, Spacer, PopupContainer, VToggleGroup, PopupManager, DialogManager, DialogContainer} from "appy-comps";
import DocStore from './DocStore.js'
import ToggleButton from './ToggleButton.jsx'
import {KEYBOARD} from './u.js'
import {EraserTool, EyedropperTool, MoveTool, PencilTool} from './Tools.jsx'
import "./web/components.css";
import "appy-style/src/look.css";
import {LoginButton} from './loginbutton.js'
import "font-awesome/css/font-awesome.css";
import DrawingSurface from './DrawingSurface.jsx'
import {DocServerAPI} from "docserver2-client"
import Button from './common/Button.jsx'
import AlertPanel from './common/AlertPanel.jsx'
import OpenDocPanel from './dialogs/OpenDocPanel.jsx'
import ResizePanel from './dialogs/ResizePanel.jsx'
import ColorPicker from './ColorPicker.jsx'
import ColorWellButton from './ColorWellButton.jsx'
import PreviewPanel from './PreviewPanel.jsx'
import LayersPanel from './LayersPanel.jsx'
import RecentColors from './RecentColors.jsx'
import BitmapModel from './BitmapModel.js'
import PopupState from './common/PopupState.jsx'
import SharePanel from './SharePanel.jsx'
import NewDocPanel from './dialogs/NewDocPanel.jsx'
import {PALETTES} from './palettes.js'
import DropdownButton from './Dropdown.jsx'
import {MenuButton} from './menubutton.js'


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.doc = DocStore.getDoc();
        this.docserver = new DocServerAPI("https://docs.josh.earth/")
        DocStore.changed(()=>this.setState({doc:DocStore.getDoc()}));
    }
    render() {
        return <div><DocPanel doc={this.state.doc} docserver={this.docserver}/></div>
    }
}

const ToggleButtonTemplate = (props) => {
    return <ToggleButton onToggle={props.onSelect}
                         selected={props.selected}
                         tooltip={props.item.tooltip}
    ><i className={"fa fa-"+props.item.icon}/></ToggleButton>
};

class DocPanel extends Component {
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

        this.model_listener = this.props.doc.model.changed((mod)=> this.setState({model:mod, dirty:true}));




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
            console.log("listing the docs")
            this.props.docserver.list("pixelimage").then(items => {
                console.log("got items",items)
                DialogManager.show(<OpenDocPanel
                    docs={items.results}
                    onCanceled={this.openDocCanceled}
                    onSelectDoc={this.openDocPerform}
                    onDeleteDoc={this.deleteDoc}
                />)
            }).catch(e => {
                console.log("got an error");
                this.showError('some error happened');
            })
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
            console.log("we need to load the doc with id",id)
            this.setState({doclist:[], dirty:false});
            this.props.docserver.load(id).then(doc => {
                doc.model = BitmapModel.fromJSON(doc.model);
                console.log("the doc is",doc)
                DialogManager.hide()
                DocStore.setDoc(doc)

            })
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
            let doc = DocStore.newDoc()
            console.log("making a new doc with the settings",settings)
            doc.model = new BitmapModel(settings.w,settings.h, PALETTES[settings.palette]);
            doc.title = settings.title;
            DocStore.setDoc(doc);
            this.setState({ doc: doc});
        };
        this.newDocCanceled = () => DialogManager.hide();

        this.saveDoc = (cb) => {
            this.props.docserver.save(DocStore.getDoc(), 'pixelimage').then(res => {
                console.log("got results",res)
                DocStore.getDoc().id=res.id;
                if(typeof cb === 'function') cb();
                this.setState({dirty:false});
            })
        };


        this.openShare = () => DialogManager.show(<SharePanel id={DocStore.getDoc().id}/>);
        this.openShareCanceled = () => DialogManager.hide();

        this.deleteDoc = (id) => {
            console.log('deleting', id)
            this.props.docserver.delete(id, 'pixelimage')
        }
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
        console.log('exporting at scale',scale)
        let doc = DocStore.getDoc()
        let canvas = document.createElement('canvas')
        canvas.width = doc.model.getWidth()*scale
        canvas.height = doc.model.getHeight()*scale
        doc.model.drawScaledCanvas(canvas,scale)
        function canvasToPNGBlob(canvas) {
            return new Promise((res,rej)=>{
                canvas.toBlob((blob)=>{
                    res(blob)
                },'image/png')
            })
        }
        function forceDownloadBlob(title,blob) {
            console.log("forcing download of",title)
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = title
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
        canvasToPNGBlob(canvas).then((blob)=> forceDownloadBlob(`${doc.title}@${scale}.png`,blob))
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
        this.props.doc.title = this.refs.doc_title.value
        this.setState({doc:this.props.doc});
    }
    canvasKeyDown(e) {
        let tool = this.tools.find((tool) => e.keyCode === tool.keyCode);
        if(tool) this.selectTool(tool);
    }

    renderSideToolbar() {
        let model = this.props.doc.model;
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
             <Button onClick={this.newDoc}    disabled={!this.props.docserver.isLoggedIn()} tooltip="New Image"><i className="fa fa-file-o"/></Button>
             <Button onClick={this.saveDoc}   disabled={!this.props.docserver.isLoggedIn()} tooltip="Save Image"><i className="fa fa-save"/></Button>
             <Button onClick={this.openDoc}   disabled={!this.props.docserver.isLoggedIn()} tooltip="Open Image"><i className="fa fa-folder-open"/></Button>
        </VBox>
    }
    renderTopToolbar() {
        let cp2 = <ColorPicker model={this.props.doc.model} onSelectColor={this.selectBGColor}/>
        let actions = [
            {
                title:'Export as PNG 1x',
                fun: () => this.exportPNG(1)
            },
            {
                title:'Export as PNG 2x',
                fun: () => this.exportPNG(2)
            },
            {
                title:'Export as PNG 4x',
                fun: () => this.exportPNG(4)
            },
            {
                title:'Export as PNG 8x',
                fun: () => this.exportPNG(8)
            },
        ]

        return <HBox className="panel top">
            <button onClick={(e)=>PopupManager.show(cp2,e.target)} className="fa fa-gear"/>
            <input type="text" ref="doc_title" value={this.props.doc.title} onChange={this.titleEdited.bind(this)}/>
            <Spacer/>
            <Button onClick={this.zoomIn}><i className="fa fa-plus"/></Button>
            <Button onClick={this.zoomOut}><i className="fa fa-minus"/></Button>
            <MenuButton actions={actions} title={''} className={'fa fa-share'}/>
            <button onClick={this.openShare}>share</button>
        </HBox>
    }
    renderBottomToolbar() {
        return <HBox className="panel bottom">
            <LoginButton docserver={this.props.docserver}/>
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
        let model = this.props.doc.model
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
