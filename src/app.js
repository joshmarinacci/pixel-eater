import React, {Component} from "react";
import {
    VBox,
    HBox,
    Spacer,
    PopupContainer,
    VToggleGroup,
    PopupManager,
    DialogManager,
    DialogContainer,
    PopupManagerContext
} from "appy-comps"
import DocStore from './DocStore.js'
import icons_spritesheet from "./images/icons@1.png";
import "appy-style/src/look.css";
import "./web/components.css";
import "./app.css";
import {LoginButton} from './loginbutton.js'
import "@fortawesome/fontawesome-free/css/all.css"
import DrawingSurface, {Point} from './DrawingSurface.jsx'
import {DocServerAPI} from "docserver2-client"
import AlertPanel from './common/AlertPanel.jsx'
import OpenDocPanel from './dialogs/OpenDocPanel.jsx'
import ResizePanel from './dialogs/ResizePanel.jsx'
import {ColorPicker} from './ColorPicker.jsx'
import {ColorWellButton, PopupImageButton} from './ColorWellButton.jsx'
import PreviewPanel from './PreviewPanel.jsx'
import LayersPanel from './LayersPanel.jsx'
import RecentColors from './RecentColors.jsx'
import BitmapModel from './BitmapModel.js'
import PopupState from './common/PopupState.jsx'
import NewDocPanel from './dialogs/NewDocPanel.jsx'
import {PALETTES} from './palettes.js'
import {MenuButton} from './menubutton.js'
import {MainLayout} from './MainLayout.js'
import {ImageButton, ImageToggleButton} from "./ImageButton.js"
import {ToasterContainer, ToasterManager} from './common/ToasterContainer.js'
import ToggleButton from './common/ToggleButton.jsx'
import {EyedropperTool, EyedropperToolOptions} from './tools/eyedropper.js'
import {PencilTool, PencilToolOptions} from './tools/pencil.js'
import {EraserTool, EraserToolOptions} from './tools/eraser.js'
import {SelectionTool, SelectionToolOptions} from './tools/select.js'
import {MoveTool, MoveToolOptions} from './tools/move.js'
import {FillTool, FillToolOptions} from './tools/fill.js'
import {LineTool, LineToolOptions} from './tools/line.js'
import bmp from "@wokwi/bmp-ts"


export default class App extends Component {
    constructor(props) {
        super(props);
        this.state = {};
        this.state.doc = DocStore.getDoc();
        this.docserver = new DocServerAPI("https://docs.josh.earth/")
        DocStore.changed(()=>this.setState({doc:DocStore.getDoc()}));
        this.pm = new PopupManager()
    }
    render() {
        return (
        <PopupManagerContext.Provider value={this.pm}>
            <DocPanel doc={this.state.doc} docserver={this.docserver}/>
        </PopupManagerContext.Provider>
        )
    }
}

const ToggleButtonTemplate = (props) => {
    return <ImageToggleButton
        onToggle={props.onSelect}
        selected={props.selected}
        tooltip={props.item.tooltip}
        src={icons_spritesheet} scale={2} spriteX={props.item.spriteX} spriteY={props.item.spriteY}
    />
};

class DocPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            drawGrid:true,
            drawPreview:false,
            showLayers:false,
            fullscreen:false,
            scrollTouch:false,
            selectedColor:1,
            scale: 16,
            dirty:false
        };

        this.tools = [
            {
                tool: new PencilTool(this),
                name:'pencil',
                tooltip:'Pencil',
                spriteX:0,
                spriteY:1,
                key:'p',
                options_panel_component: PencilToolOptions,
            },
            {
                tool: new EraserTool(this),
                name:'eraser',
                tooltip:'Eraser',
                spriteX:0,
                spriteY:2,
                key:'e',
                options_panel_component: EraserToolOptions,
            },
            {
                tool: new LineTool(this),
                name:'line',
                tooltip: 'Line',
                spriteX:1,
                spriteY:1,
                key:'l',
                options_panel_component: LineToolOptions,
            },
            {
                tool: new EyedropperTool(this),
                name:'eyedropper',
                tooltip:'Eyedropper',
                spriteX:2,
                spriteY:0,
                key:'i',
                options_panel_component: EyedropperToolOptions,
            },
            {
                tool: new FillTool(this),
                name:'fill',
                spriteX:3,
                spriteY:0,
                tooltip: 'Fill',
                key:'f',
                options_panel_component: FillToolOptions
            },
            {
                tool: new MoveTool(this),
                name:'move',
                tooltip:'Move Layer(s)',
                spriteX:3,
                spriteY:1,
                key:'v',
                options_panel_component: MoveToolOptions,
            },
            {
                tool: new SelectionTool(this),
                name:'selection',
                tooltip: 'Selection',
                spriteX:2,
                spriteY:1,
                key:'s',
                options_panel_component: SelectionToolOptions
            }
        ];

        this.state.selected_tool = this.tools[0];
        this.selectTool = (item) => this.setState({selected_tool:item});

        this.state.user = null;
        this.state.doclist = [];
        this.state.recentColors = [];

        this.model_listener = this.props.doc.model.changed((mod)=> this.setState({model:mod, dirty:true}));

        let fullscreen_handler = () => {
            if (document.fullscreenElement || document.webkitFullscreenElement) {
                // console.log("entered")
            } else {
                // console.log("exited")
            }
        }

        document.addEventListener('fullscreenchange', fullscreen_handler)
        document.addEventListener('webkitfullscreenchange',fullscreen_handler)
        this.toggleGrid = () => this.setState({drawGrid: !this.state.drawGrid});
        this.togglePreview = () => this.setState({ drawPreview: !this.state.drawPreview});
        this.toggleLayers = () => this.setState({ showLayers: !this.state.showLayers});
        this.toggleFullscreen = () => {
            if(this.state.fullscreen) {
                document.exitFullscreen()
                this.setState({fullscreen:!this.state.fullscreen})
            } else {
                document.querySelector("#root").requestFullscreen()
                this.setState({fullscreen:!this.state.fullscreen})
            }
        }
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
                if(items.success === false || !items.results){
                    console.log("couldnt load the items")
                    DialogManager.show(<AlertPanel
                        text="Could not connect to server. Make sure you have internet access and are logged into the server"
                        okayText="Dismiss"
                        cancelText="Dismiss"
                        onCancel={()=>DialogManager.hide()}
                        onOkay={()=>DialogManager.hide()}
                    />);

                } else {
                    console.log("got items", items)
                    DialogManager.show(<OpenDocPanel
                        docs={items.results}
                        docserver={this.props.docserver}
                        onCanceled={this.openDocCanceled}
                        onSelectDoc={this.openDocPerform}
                        onDeleteDoc={this.deleteDoc}
                    />)
                }
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
                console.log("loaded the doc",doc.id)
                if(!doc.tools) {
                    doc.tools = {
                        pencil:{
                            state:{
                                size:1,
                                fill_mode:'color',
                            }
                        },
                        eraser: {
                            state: {
                                size:1,
                            }
                        },
                        move: {
                            state: {
                                shiftLayerOnly:true,
                            }
                        },
                        line: {
                            state: {
                                mode:'line'
                            }
                        },
                        fill: {
                            state: {
                                mode:'color'
                            }
                        },
                        eyedropper:{
                            state: {

                            }
                        },
                        selection: {
                            state:{

                            }
                        }
                    }
                }

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

        this.saveDoc = () => {
            let doc = DocStore.getDoc()
            ToasterManager.add('saving ' + doc.title);
            this.props.docserver.save(doc, 'pixelimage').then(res => {
                console.log("res is",res)
                DocStore.getDoc().id=res.doc._id;
                console.log("saved the doc with id",DocStore.getDoc().id)
                DocStore.saveThumbnail(DocStore.getDoc(),this.props.docserver).then(()=>{
                    ToasterManager.add('saved ' + doc.title);
                    this.setState({dirty:false});
                })
            })
        };

        this.deleteDoc = (id) => {
            console.log('deleting', id)
            this.props.docserver.delete(id, 'pixelimage')
        }
        this.selectBGColor = (color) => {
            PopupState.done();
            this.props.doc.model.setBackgroundColor(color);
        };
        this.selectColor = (color) => this.setState({selectedColor:color});


        document.addEventListener('keydown',(e)=>{
            if(e.metaKey && e.key === 's') {
                this.saveDoc()
                e.preventDefault()
                e.stopPropagation()
            }
            if(e.metaKey && e.key === 'n') {
                this.newDoc()
                e.preventDefault()
                e.stopPropagation()
            }
            if(e.metaKey && e.key === 'o') {
                this.openDoc()
                e.preventDefault()
                e.stopPropagation()
            }
            if(e.metaKey && e.key === '=') {
                this.zoomIn()
                e.preventDefault()
                e.stopPropagation()
            }
            if(e.metaKey && e.key === '-') {
                this.zoomOut()
                e.preventDefault()
                e.stopPropagation()
            }

            if(e.target.nodeName === 'INPUT') return
            if(e.key === 'd') return this.props.doc.model.resetSelection()
            let tool = this.tools.find((tool) => e.key === tool.key);
            if(tool && !e.metaKey) return this.selectTool(tool)
            let model = this.props.doc.model
            if(e.metaKey && e.key === 'z' && e.shiftKey === false) {
                if(model.isUndoAvailable()) model.execUndo()
                return
            }
            if(e.metaKey && e.key === 'z' && e.shiftKey === true) {
                if(model.isRedoAvailable()) model.execRedo()
                return
            }
        }, {capture:true})
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
    exportBMP(scale) {
        console.log('exporting BMP at scale',scale)


        //render document to canvas
        let doc = DocStore.getDoc()
        let canvas = document.createElement('canvas')
        canvas.width = doc.model.getWidth()*scale
        canvas.height = doc.model.getHeight()*scale
        doc.model.drawScaledCanvas(canvas,scale)

        //get ImageData from the canvas
        let id_orig = canvas.getContext('2d').getImageData(0,0,canvas.width,canvas.height)


        //copy ImageData to a new structure and swizzle the byte order to ABGR
        let id = {
            width:canvas.width,
            height:canvas.height,
            // data: new Array(5*5*4),
        }
        id.data = new Array(id.width*id.height*4)
        id.data.fill(0)
        function copy_pixel(x,y) {
            let n = (x + id.width * y)*4
            id.data[n+0] = 255 //A
            id.data[n+1] = id_orig.data[n+2] //B
            id.data[n+2] = id_orig.data[n+1] //G
            id.data[n+3] = id_orig.data[n+0] //R
        }
        for(let i=0; i<id_orig.width; i++) {
            for(let j=0; j<id_orig.height; j++) {
                copy_pixel(i,j)
            }
        }
        function strToRGBObj(str) {
            let num = parseInt(str.substring(1),16)
            let blue = (num & 0x0000FF)
            let red =  (num & 0xFF0000) >> 16
            let green =  (num & 0x00FF00) >> 8
            return {
                red:red,
                green:green,
                blue:blue,
                quad:255,
            }
        }


        // Convert the palete to {red,green,blue,quad} structs
        let palette = doc.model.palette.map(str => strToRGBObj(str))
        console.log("final palette",palette)
        while(palette.length < 128) {
            palette.push({red:0,green:255,blue:0,quad:255})
        }

        // encode into a BMP
        const rawData = bmp.encode({
            data:id.data,
            bitPP: 8,
            width:id.width,
            height:id.height,
            // palette:palette.slice(0,8)
            palette:palette
        });
        console.log("got a raw buffer",rawData)
        // console.log("sdefault header",0x42, 0x4D)
        // turn into a blob
        let blob = new Blob([rawData.dataView], {type:'image/bmp'})
        console.log("blob type",blob.type)

        //force download the blob
        function forceDownloadBlob(title,blob) {
            console.log("forcing download of",title)
            const a = document.createElement('a')
            a.href = URL.createObjectURL(blob)
            a.download = title
            document.body.appendChild(a)
            a.click()
            document.body.removeChild(a)
        }
        forceDownloadBlob(`${doc.title}@${scale}.bmp`,blob)
    }

    drawStamp(pt, stamp, new_color) {
        const model = this.props.doc.model
        const layer = model.getCurrentLayer()
        if(!layer) return;
        if(!model.isLayerVisible(layer)) return;
        model.stampOnLayer(pt,stamp,layer);
        this.appendRecentColor(new_color);
    }
    fillStamp(pt, stamp, pattern) {
        const model = this.props.doc.model
        const layer = model.getCurrentLayer()
        if(!layer) return;
        if(!model.isLayerVisible(layer)) return;
        model.fillStamp(pt,stamp,pattern);
    }
    makePasteClone() {
        let model = this.props.doc.model
        let layer = model.getCurrentLayer()
        let position = Point.makePoint(0,0)
        let dimensions = {w: model.getWidth(), h: model.getHeight()}
        let buffer = model.stampFromLayer(position,dimensions,layer)
        return { layer, position, dimensions, buffer, model }
    }
    completePasteClone(before) {
        let after = this.makePasteClone()
        let redo = () => {
            after.model.stampOnLayer(after.position,after.buffer,after.layer);
            after.model.fireUpdate();
        };
        let undo = () => {
            before.model.stampOnLayer(before.position,before.buffer,before.layer);
            before.model.fireUpdate();
        };
        after.model.appendCommand(undo,redo);
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

    renderSideToolbar() {
        let model = this.props.doc.model;
        let cp =  <ColorPicker model={model} onSelectColor={this.selectColor}/>;
        return <VBox className="panel left" id={"side-toolbar"}>
             <ColorWellButton model={model} selectedColor={this.state.selectedColor} content={cp}/>
             <VToggleGroup list={this.tools} selected={this.state.selected_tool} template={ToggleButtonTemplate} onChange={this.selectTool}/>
             <Spacer/>
             <ImageButton
                 onClick={this.execUndo}
                 disabled={!model.isUndoAvailable()}
                 tooltip="Undo"
                 src={icons_spritesheet} scale={2} spriteX={1} spriteY={2}
             />
             <ImageButton
                 onClick={this.execRedo}
                 disabled={!model.isRedoAvailable()}
                 tooltip="Redo"
                 src={icons_spritesheet} scale={2} spriteX={2} spriteY={2}
             />
            <Spacer/>
            <PopupImageButton
                content={<ColorPicker model={this.props.doc.model} onSelectColor={this.selectBGColor}/>}
                         tooltip="Settings"
                         src={icons_spritesheet} scale={2} spriteX={4} spriteY={1}
            />
             <ImageToggleButton
                 onToggle={this.toggleGrid}
                 selected={this.state.drawGrid}
                 tooltip="Show/Hide Grid"
                 src={icons_spritesheet} scale={2} spriteX={4} spriteY={0}
             />
             <ImageToggleButton
                 onToggle={this.togglePreview}
                 selected={this.state.drawPreview}
                 tooltip="Show/Hide Preview"
                 src={icons_spritesheet} scale={2} spriteX={2} spriteY={3}
             />
             <ImageToggleButton
                 onToggle={this.toggleLayers}
                 selected={this.state.showLayers}
                 tooltip="Show/Hide Layers"
                 src={icons_spritesheet} scale={2} spriteX={3} spriteY={3}
             />
            <ImageButton
                onClick={this.toggleFullscreen}
                tooltip="Full Screen"
                src={icons_spritesheet} scale={2} spriteX={4} spriteY={3}
            />
        </VBox>
    }
    renderTopToolbar(model) {
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
            {
                title:'Export as BMP 1x',
                fun: () => this.exportBMP(1)
            }
        ]

        return <HBox className="panel top" id={"top-toolbar"}>
            <input type="text" ref="doc_title" value={this.props.doc.title} onChange={this.titleEdited.bind(this)}/>
            <label><i>{this.state.dirty?"*":""}</i></label>
            <label>{model.getWidth()}&nbsp;x&nbsp;{model.getHeight()}</label>
            <Spacer/>
            <ImageButton
                onClick={this.newDoc}
                disabled={!this.props.docserver.isLoggedIn()}
                tooltip="New Image"
                src={icons_spritesheet} scale={2} spriteX={0} spriteY={0}
            />
            <ImageButton
                onClick={this.saveDoc}
                disabled={!this.props.docserver.isLoggedIn()}
                tooltip="Save Image"
                src={icons_spritesheet} scale={2} spriteX={1} spriteY={0}
            />
            <ImageButton
                onClick={this.openDoc}
                disabled={!this.props.docserver.isLoggedIn()}
                tooltip="Open Image"
                src={icons_spritesheet} scale={2} spriteX={5} spriteY={0}
            />
            <ImageButton
                onClick={this.resizeDoc}
                tooltip="Resize Doc"
                src={icons_spritesheet} scale={2} spriteX={3} spriteY={2}
            />
            <MenuButton
                actions={actions}
                title={''}
                className={'fa fa-share'}
                src={icons_spritesheet} scale={2} spriteX={6} spriteY={0}
            />
            <Spacer/>
            <LoginButton docserver={this.props.docserver}/>
        </HBox>
    }

    renderPreviewPanel() {
        return this.state.drawPreview?<VBox className="panel right" id={"preview-panel"}>
            <header>Preview</header>
            <PreviewPanel model={this.props.doc.model}/>
        </VBox>:"";
    }
    renderLayersPanel() {
        return this.state.showLayers? <VBox className="panel right" id={"layers-panel-wrapper"}>
            <header>Layers</header>
            <LayersPanel model={this.props.doc.model}/>
        </VBox>:""
    }
    renderOptionsToolbar() {
        let Opts = this.state.selected_tool.options_panel_component
        return <HBox className="panel top" id={"options-toolbar"}>
            <ImageButton onClick={this.zoomIn}
                         src={icons_spritesheet} scale={2} spriteX={0} spriteY={3}
            />
            <ImageButton onClick={this.zoomOut}
                         src={icons_spritesheet} scale={2} spriteX={1} spriteY={3}
            />
            <ToggleButton selected={this.state.scrollTouch} onToggle={()=>{
                this.setState({scrollTouch:!this.state.scrollTouch})
            }}>scroll</ToggleButton>
            <Spacer/>
            <Opts doc={this.props.doc}/>
        </HBox>
    }
    render() {
        let model = this.props.doc.model
        return (<MainLayout showLayers={this.state.showLayers} showPreview={this.state.drawPreview}>
            {this.renderSideToolbar()}
            {this.renderTopToolbar(model)}
            {this.renderOptionsToolbar() }
            <DrawingSurface
                tabIndex="1"
                tool={this.state.selected_tool.tool}
                selected_tool={this.state.selected_tool}
                model={model}
                drawGrid={this.state.drawGrid}
                scale={this.state.scale}
                doc={this.props.doc}
                scrollTouch={this.state.scrollTouch}
            />
            <RecentColors colors={this.state.recentColors} model={model} onSelectColor={this.selectColor}/>
            {this.renderPreviewPanel()}
            {this.renderLayersPanel()}
            <ToasterContainer/>
            <DialogContainer/>
            <PopupContainer/>
        </MainLayout>)
    }
}
