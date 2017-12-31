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
import SimpleList from './SimpleList'

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

const SheetListItemRenderer = (props) => {
    const style = {
        border:'1px solid black'
    }
    if(props.selected) style.backgroundColor ='#ccddff'
    return <div style={style}>{props.item.get('name')}</div>
}

const TileViewItemRenderer = (props) => {
    const style = { border: '1px solid black'};
    if(props.selected) style.border = '1px solid red';
    return <TileView style={style} sprite={props.item} scale={2} store={IS} palette={props.palette} onClick={()=>props.onClick(props.index)}/>
}

export default class App extends Component {
    constructor(props) {
        super(props);
        IS.on('changed', doc =>this.setState({doc:doc}))
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
            selectedSheetIndex: 0,
            selectedTileIndex: 0,
            selectedTool:this.tools[0],
            scale: 6
        };

        this.zoomIn  = () => this.setState({scale:this.state.scale+1})
        this.zoomOut = () => this.setState({scale:this.state.scale-1})

        this.undoCommand = () => IS.undoCommand()
        this.redoCommand = () => IS.redoCommand()

        this.getSelectedSheet = () => this.state.doc.get('sheets').get(0)
        this.selectTile = (index) => this.setState({selectedTileIndex:index})
        this.getSelectedTile = () => this.getSelectedSheet().get('tiles').get(this.state.selectedTileIndex)

        this.addTileToSheet = () => IS.addTileToSheet(this.getSelectedSheet());
        this.removeTileFromSheet = () => {
            IS.removeTileFromSheet(this.getSelectedSheet(),this.getSelectedTile())
            this.setState({selectedTileIndex:0})
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
        const tile = this.getSelectedTile()
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
            gridTemplateColumns: "[left] 200px [layers] 200px [center] auto [drawingtools] 50px [right] 100px",
            gridTemplateRows: "[toolbar] 3em [center] auto [statusbar] 3em",
            // alignItems:'stretch'
        }
        return <div style={gridStyle}>
            <HBox className='border-bottom' style={{ gridRow:'toolbar', gridColumn:'left/-1'}}>
                <button onClick={this.undoCommand}>undo</button>
                <button onClick={this.redoCommand}>redo</button>
            </HBox>
            <div className="border-left" style={{ gridColumn:'left/center', gridRow:'center/statusbar', display:'flex', flexDirection:'row'}}>
                <CollapsingPanel title="sheets" style={{border:'1px solid #888', backgroundColor:'#dddddd'}}>
                    <SimpleList
                        list={this.state.doc.get('sheets')}
                        style={{width:'100px', border:'1px solid blue'}}
                        orientation={'vertical'}
                        renderer={SheetListItemRenderer}
                        selectedItem={this.state.doc.get('sheets').get(this.state.selectedSheetIndex)}
                    />
                </CollapsingPanel>
                {this.renderTileSheet(this.state.doc.get('sheets').get(0))}
            </div>
            <VBox className="border-right border-left" style={{ gridColumn:'layers/center', gridRow:'center/statusbar'}}>
                <div>layers</div>
                <div>draw tools</div>
                <button onClick={this.zoomIn}>zoom in</button>
                <button onClick={this.zoomOut}>zoom out</button>
            </VBox>
            {this.renderDrawingSurface()}
            <div className="border-left" style={{ gridColumn:'right', gridRow:'center/statusbar' }}>preview</div>
            <div className="border-top border-bottom border" style={{ gridColumn:'left/-1', gridRow:'statusbar/-1'}}>status bar</div>
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
        return <CollapsingPanel title="tiles" style={{border:'1px solid #888', backgroundColor:'#dddddd'}}>
            <VBox>
                <SimpleList
                    style={{flex:1}}
                    list={sheet.get('tiles')}
                    renderer={TileViewItemRenderer}
                    palette={sheet.get('palette')}
                    onClick={this.selectTile}
                    selectedItem={sheet.get('tiles').get(this.state.selectedTileIndex)}
                    orientation='wrap'
                />
                <HBox>
                    <button onClick={this.addTileToSheet}>add new sprite</button>
                    <button onClick={this.removeTileFromSheet}>remove sprite</button>
                </HBox>
            </VBox>
        </CollapsingPanel>
    }
    renderDrawingSurface() {
        const pal = this.getSelectedSheet().get('palette')
        return <div style={{
            border:'1px solid black',
            gridColumn:'center/right',
            gridRow:'center/statusbar',
            overflow:'scroll',
        }}>
            <DrawingSurface
                tabIndex="1"
                tool={this.state.selectedTool.tool} model={this.getSelectedTile()} drawGrid={true} scale={Math.pow(2,this.state.scale)}
                palette={pal}
                store={IS}
                onKeyDown={()=>console.log("keypress")}
                onZoomIn={this.zoomIn}
                onZoomOut={this.zoomOut}
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
        const overrideStyle = this.props.style?this.props.style:{}
        const style = Object.assign(overrideStyle,{})
        return <canvas
            style={style}
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

class CollapsingPanel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open:false
        }
        this.toggleOpen = () => this.setState({open:!this.state.open})
    }
    render() {
        const overrideStyle = this.props.style?this.props.style:{}
        const style = Object.assign(overrideStyle,{})
        if(this.state.open) {
            return <VBox style={style}>
                    <HBox style={{backgroundColor:'black', color:'white'}}>
                        <button className="fa fa-chevron-down" onClick={this.toggleOpen}/>
                        {this.props.title}
                    </HBox>
                    {this.state.open?this.props.children:""}
                </VBox>

        } else {
            return <VBox style={style}>
                    <button className="fa fa-chevron-right" onClick={this.toggleOpen}/>
                </VBox>
        }
    }
}

