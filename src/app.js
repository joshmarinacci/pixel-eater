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


import ImmutableStore from "./ImmutableStore";

const IS = new ImmutableStore()

class P  {
    constructor(x,y) {
        this.x = x
        this.y = y
    }
    sub(pt) {
        return new P(this.x-pt.x,this.y-pt.y)
    }
    div(scalar) {
        return new P(this.x/scalar, this.y/scalar)
    }
    floor() {
        return new P(Math.floor(this.x),Math.floor(this.y))
    }
}

// IS.setPixelOnTile(null,0,0,5)


//
// const ToggleButtonTemplate = (props) => {
//     return <ToggleButton onToggle={props.onSelect}
//                          selected={props.selected}
//                          tooltip={props.item.tooltip}
//     ><i className={"fa fa-"+props.item.icon}></i></ToggleButton>
// };

export default class App extends Component {
    constructor(props) {
        super(props);
        IS.on('changed', doc =>this.setState({doc:doc}))
        // this.state.doc = DocStore.getDoc();
        // DocStore.changed(()=>this.setState({doc:DocStore.getDoc()}));
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

        this.state = {
            doc: IS.getDoc(),
            // drawGrid:true,
            // drawPreview:false,
            // showLayers:true,
            // selectedColor:1,
            // scale: 16,
            // dirty:false,
            selectedTileIndex: 0,
            selectedTool:this.tools[0],
        };
        this.undoCommand = () => IS.undoCommand()
        this.redoCommand = () => IS.redoCommand()
        this.selectTile = (index) => {
            this.setState({selectedTileIndex:index})
        }
        // this.state.shiftLayerOnly = false;


        // this.selectTool = (item) => this.setState({selected_tool:item});

        // this.state.user = null;
        // this.state.doclist = [];
        // this.state.recentColors = [];

        // this.model_listener = this.props.doc.model.changed((mod)=> this.setState({model:mod, dirty:true}));

        // this.toggleGrid = () => this.setState({drawGrid: !this.state.drawGrid});
        // this.togglePreview = () => this.setState({ drawPreview: !this.state.drawPreview});
        // this.toggleLayers = () => this.setState({ showLayers: !this.state.showLayers});
        // this.zoomIn = () => this.setState({scale: this.state.scale<<1});
        // this.zoomOut = () => this.setState({scale: this.state.scale>>1});
        // this.resizeDoc = () => DialogManager.show(<ResizePanel model={this.props.doc.model}/>);

        // this.execUndo = () => this.props.doc.model.execUndo();
        // this.execRedo = () => this.props.doc.model.execRedo();

        this.showError = (txt) => {
            DialogManager.show(<AlertPanel
                text={txt}
                okayText="Okay"
                onOkay={()=> DialogManager.hide()}
                />);
        };


        // this.selectBGColor = (color) => {
        //     PopupState.done();
        //     this.props.doc.model.setBackgroundColor(color);
        // };
        // this.selectColor = (color) => this.setState({selectedColor:color});
    }
    /*
    exportPNG(scale) {
        PopupState.done();
        this.saveDoc(function() {
            document.location.href = Config.url("/preview/")
                + DocStore.getDoc().id
                + "?download=true"
                + "&scale="+scale
                +"&"+Math.floor(Math.random()*100000);
        });
    }*/
    /*
    setPixel(pt,new_color) {
        var model = this.props.doc.model;
        var layer = model.getCurrentLayer();
        if(!layer) return;
        if(!model.isLayerVisible(layer)) return;
        model.setPixel(pt,new_color);
        this.appendRecentColor(new_color);
    }
    */
    drawStamp(pt, stamp, new_color) {
        const tile = this.state.doc.get('sheets').get(0).get('tiles').get('0')
        const layer = tile.get('layers').get(0)
        if(!layer) return;
        if(!layer.get('visible')) return;
        IS.setPixelOnTile(tile,pt.x,pt.y,1)
        // model.drawStamp(pt,stamp);
        // this.appendRecentColor(new_color);
    }
    /*
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
    */


    render() {
        const gridStyle = {
            position:'absolute',
            top:0, bottom:0, right:0, left:0,
            display:'grid',
            border:'1px solid red',
            gridTemplateColumns: "[left]400px [center]auto [right]300px",
            gridTemplateRows: "[toolbar]50px [center]auto [statusbar]50px",
            alignItems:'stretch'
        }
        return <div style={gridStyle}>
            <div style={{ gridRow:'toolbar'}}>
                <button onClick={this.undoCommand}>undo</button>
                <button onClick={this.redoCommand}>redo</button>
            </div>
            <div style={{ gridColumn:'left/center', gridRow:'center', border:'1px solid green', display:'flex', flexDirection:'row'}}>
                <div style={{ border: '1px solid green', width:'100px' }}>doc list</div>
                <div style={{ border:'1px solid green', width:'100px'}}>
                    {this.renderTileSheet(this.state.doc.get('sheets').get(0))}
                </div>
            </div>
            <div style={{ gridColumn:'center/right', gridRow:'center', border:'1px solid green', alignItems:'stretch', display:'flex'}}>
                <TileEditor
                    selectedTool={this.state.selectedTool}
                    tile={this.state.doc.get('sheets').get(0).get('tiles').get(this.state.selectedTileIndex)}
                    sheet={this.state.doc.get('sheets').get(0)}
                />
            </div>
            <div style={{ gridColumn:'right', gridRow:'center', border:'1px solid green'}}>preview</div>
            {/*{this.renderSideToolbar()}*/}
            {/*{this.renderTopToolbar()}*/}
                    {/*{this.state.selected_tool.tool.getOptionsPanel()}*/}
                {/*<RecentColors colors={this.state.recentColors} model={model} onSelectColor={this.selectColor}/>*/}
                {/*{this.renderBottomToolbar()}*/}
            {/*{this.renderPreviewPanel()}*/}
            {/*{this.renderLayersPanel()}*/}
            <DialogContainer/>
            <PopupContainer/>
        </div>
    }

    renderSideToolbar() {
        let model = this.props.doc.model;
        var loggedOut = UserStore.getUser()===null;
        let cp =  <ColorPicker model={model} onSelectColor={this.selectColor}/>;
        return <VBox className="panel left">
            <ColorWellButton model={model} selectedColor={this.state.selectedColor} content={cp}/>
            {/*<VToggleGroup list={this.tools} selected={this.state.selected_tool} template={ToggleButtonTemplate} onChange={this.selectTool}/>*/}
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

    renderTileSheet(sheet) {
        const tiles = sheet.get('tiles');
        const pal = sheet.get('palette')
        const output = tiles.map((tile,i)=>{
            return <TileView key={i} sprite={tile} scale={2} store={IS} palette={pal}
                             onClick={()=>this.selectTile(i)}/>
        })
        return <div style={{ display:'flex', flexDirection:'column', alignItems:'start'}}>{output}</div>
    }
}

class TileEditor extends Component{
    render() {
        const pal = this.props.sheet.get('palette')
        return <div style={{ display:'flex', flexDirection:'row', alignItems: 'stretch', border:'1px solid red', flex:'1'}}>
            <div style={{flex:'0'}}>layers</div>
            <div>toolbar</div>
            <DrawingSurface
                tabIndex="1"
                tool={this.props.selectedTool.tool} model={this.props.tile} drawGrid={true} scale={16}
                palette={pal}
                store={IS}
                // onKeyDown={this.canvasKeyDown.bind(this)}
            />
        </div>
    }
}


class CanvasComponent extends Component {
    constructor(props) {
        super(props)
        this.scale = 8
        if(props.scale) this.scale = props.scale
    }
    componentDidMount() {
        this.draw();
    }
    setState(state) {
        super.setState(state)
        setTimeout(() => this.draw(),100)
    }
    toCanvas(e) {
        const rect = this.canvas.getBoundingClientRect()
        return new P(e.clientX,e.clientY).sub(new P(rect.left,rect.top))
    }
    render() {
        return <div><canvas
            ref={(can)=>this.canvas = can}
            width={400} height={400}
            onMouseDown={(e) => this.mousedown(this.toCanvas(e),e)}
            onMouseMove={this.mousemove}
            onMouseUp={this.mouseup}
        /></div>
    }
}

class TileView extends CanvasComponent {
    componentWillReceiveProps(props) {
        setTimeout(() => this.draw(),100)
    }
    mousedown = (pt,e) => {
        if(this.props.onClick) this.props.onClick(this.props.sprite)
    }
    render() {
        return <canvas
            style={{border:'1px solid black'}}
            ref={(can)=>this.canvas = can}
            width={this.scale*IS.getTileWidth(this.props.sprite)}
            height={this.scale*IS.getTileHeight(this.props.sprite)}
            onMouseDown={(e) => this.mousedown(this.toCanvas(e),e)}
            onMouseMove={this.mousemove}
            onMouseUp={this.mouseup}
        />
    }

    draw() {
        if(!this.canvas) return
        const c = this.canvas.getContext('2d')
        this.drawSprite(c,this.props.sprite,this.scale)
    }
    drawSprite(c, sprite, scale) {
        sprite.get('layers').forEach((layer) => this.drawLayer(c,layer))
    }
    drawLayer(c, layer) {
        if(!layer.get('visible')) return;
        c.save();
        c.globalAlpha = layer.opacity;
        let sc = this.props.scale;
        let model = this.props.sprite;
        for(let y=0; y<this.getHeight(); y++) {
            for (let x = 0; x < this.getWidth(); x++) {
                const val = this.props.store.getPixelOnLayer(layer, x, y);
                if(val === -1) continue;
                c.fillStyle = this.props.store.lookupPaletteColor(this.props.palette, val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }
        c.restore();
    }
    getWidth() {
        return this.props.store.getTileWidth(this.props.model)
    }
    getHeight() {
        return this.props.store.getTileHeight(this.props.model)
    }
}



