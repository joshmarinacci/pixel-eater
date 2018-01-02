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

const ToggleButtonTemplate = (props) => {
    return <ToggleButton onToggle={props.onSelect}
                         selected={props.selected}
                         tooltip={props.item.tooltip}
    ><i className={"fa fa-"+props.item.icon}></i></ToggleButton>
};

export default class App extends Component {
    constructor(props) {
        super(props);
        IS.on('changed', doc =>this.setState({doc:doc}))
        this.tools = [
            {
                tool: new PencilTool(this, 1),
                tooltip:'Pencil',
                icon:'pencil',
                keyCode: KEYBOARD.P
            },
            {
                tool: new PencilTool(this, 3),
                tooltip:'Fat Pencil',
                icon:'pencil',
                // keyCode: KEYBOARD.P
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
            drawGrid:true,
            selectedColor:1,
            selectedSheetIndex: 0,
            selectedTileIndex: 0,
            selectedLayerIndex: 0,
            selectedTool:this.tools[0],
            scale: 6
        };

        this.zoomIn  = () => this.setState({scale:this.state.scale+1})
        this.zoomOut = () => this.setState({scale:this.state.scale-1})

        this.undoCommand = () => IS.undoCommand()
        this.redoCommand = () => IS.redoCommand()

        this.getSelectedSheet = () => this.state.doc.get('sheets').get(0)
        this.getCurrentPalette = () => this.getSelectedSheet().get('palette')
        this.selectTile = (index) => this.setState({selectedTileIndex:index})
        this.getSelectedTile = () => this.getSelectedSheet().get('tiles').get(this.state.selectedTileIndex)
        this.selectLayer = (layer,index) => this.setState({selectedLayerIndex:index})
        this.getSelectedLayer = () => this.getSelectedTile().get('layers').get(this.state.selectedLayerIndex)

        this.addTileToSheet = () => IS.addTileToSheet(this.getSelectedSheet());
        this.removeTileFromSheet = () => {
            IS.removeTileFromSheet(this.getSelectedSheet(),this.getSelectedTile())
            this.setState({selectedTileIndex:0})
        }
        this.selectTool = (item) => this.setState({selectedTool:item});
        this.toggleGrid = () => this.setState({drawGrid: !this.state.drawGrid});

        this.showError = (txt) => {
            DialogManager.show(<AlertPanel
                text={txt}
                okayText="Okay"
                onOkay={()=> DialogManager.hide()}
                />);
        };

        this.selectColor = (color) => this.setState({selectedColor:color});
        this.getColorAtPixel = (pt) => IS.getPixelOnLayer(this.getSelectedLayer(),pt.x,pt.y)
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
    drawStamp(pt, stamp, new_color) {
        IS.setStampOnTile(this.getSelectedTile(),this.getSelectedLayer(),pt.x,pt.y,stamp)
        // this.appendRecentColor(new_color);
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
    canvasKeyDown = (e) => {
        let tool = this.tools.find((tool) => e.keyCode === tool.keyCode);
        if(tool) this.selectTool(tool);
    }



    render() {
        const gridStyle = {
            position:'absolute',
            top:0, bottom:0, right:0, left:0,
            display:'grid',
            border:'1px solid red',
            gridTemplateColumns: "[left] 300px [center] auto [drawingtools] 50px [right] 300px",
            gridTemplateRows: "[toolbar] 3em [center] auto [statusbar] 3em",
        }
        return <div style={gridStyle}>
            {this.renderTopToolbar()}
            <div className="border-left" style={{ gridColumn:'1/-1', gridRow:'center/statusbar', display:'flex', flexDirection:'row', overflow:'scroll'}}>
                {this.renderDocSelector()}
                {this.renderTileSheet(this.state.doc.get('sheets').get(0))}
                {this.renderDrawingToolsPanel()}
                {this.renderDrawingSurface()}
                {this.renderSceneEditor()}
            </div>
            {this.renderBottomToolbar()}
            <DialogContainer/>
            <PopupContainer/>
        </div>
    }

    renderTopToolbar() {
        return <HBox className='border-bottom' style={{ gridRow:'toolbar', gridColumn:'left/-1'}}>
            <Spacer/>
            <button onClick={this.undoCommand}>undo</button>
            <button onClick={this.redoCommand}>redo</button>
            <Spacer/>
            <button onClick={this.zoomIn}>zoom in</button>
            <button onClick={this.zoomOut}>zoom out</button>
            <button onClick={this.toggleGrid}>show grid</button>
            <Spacer/>
        </HBox>
    }

    renderDocSelector() {
        return <CollapsingPanel title="sheets" width='200px' style={{border:'1px solid #888', backgroundColor:'#dddddd'}}>
            <SimpleList
                list={this.state.doc.get('sheets')}
                style={{flex:1}}
                orientation={'vertical'}
                renderer={SheetListItemRenderer}
                selectedItem={this.state.doc.get('sheets').get(this.state.selectedSheetIndex)}
            />
        </CollapsingPanel>
    }
    renderTileSheet(sheet) {
        return <CollapsingPanel title="tiles" width='200px' style={{border:'1px solid #888', backgroundColor:'#dddddd'}}>
                <SimpleList
                    style={{flex:1}}
                    list={sheet.get('tiles')}
                    renderer={TileViewItemRenderer}
                    palette={sheet.get('palette')}
                    onClick={this.selectTile}
                    selectedItem={sheet.get('tiles').get(this.state.selectedTileIndex)}
                    orientation='wrap'
                />
                <HBox style={{flex:0}}>
                    <button onClick={this.addTileToSheet}>+</button>
                    <button onClick={this.removeTileFromSheet}>-</button>
                </HBox>
        </CollapsingPanel>
    }
    renderDrawingToolsPanel() {
        let cp =  <ColorPicker palette={this.getCurrentPalette()} onSelectColor={this.selectColor}/>;
        return <CollapsingPanel title="layers & tools" width='200px' style={{ border:'1px solid black', backgroundColor:'#dddddd'}}>
            <VBox>
                <LayersPanel
                    model={this.getSelectedTile()} store={IS}
                    selectedLayer={this.getSelectedLayer()}
                    onLayerSelected={this.selectLayer}
                />
                <HBox>
                    <ColorWellButton
                        lookupColor={(color)=> IS.lookupPaletteColor(this.getCurrentPalette(), color)}
                        selectedColor={this.state.selectedColor} content={cp}/>
                    <VToggleGroup
                        list={this.tools}
                        selected={this.state.selectedTool}
                        template={ToggleButtonTemplate}
                        onChange={this.selectTool}/>

                </HBox>
            </VBox>
        </CollapsingPanel>
    }
    renderDrawingSurface() {
        const pal = this.getSelectedSheet().get('palette')
        return <div style={{
            border:'1px solid black',
            overflow:'scroll',
            flex:1
        }}>
            <DrawingSurface
                tabIndex="1"
                tool={this.state.selectedTool.tool}
                model={this.getSelectedTile()}
                drawGrid={this.state.drawGrid}
                scale={Math.pow(2,this.state.scale)}
                palette={pal}
                store={IS}
                onKeyDown={this.canvasKeyDown}
                onZoomIn={this.zoomIn}
                onZoomOut={this.zoomOut}
            />
        </div>
    }
    renderSceneEditor() {
        return <CollapsingPanel title="preview" flex={1} style={{
            border:'1px solid #888',
            borderWidth:'0 0 0 1px',
            backgroundColor:'#dddddd',
        }}>
            <div style={{overflow:'scroll'}}>
                <SceneEditorView store={IS} scene={IS.getDefaultScene()} tile={this.getSelectedTile()} sheet={this.getSelectedSheet()}/>
            </div>
        </CollapsingPanel>
    }

    renderBottomToolbar() {
        return <div className="border-top border-bottom border" style={{ gridColumn:'left/-1', gridRow:'statusbar/-1'}}>status bar</div>
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
        drawSprite(this.props.store, this.props.palette , c, this.props.sprite, this.scale)
    }
    getWidth() {
        return this.props.store.getTileWidth(this.props.model)
    }
    getHeight() {
        return this.props.store.getTileHeight(this.props.model)
    }
}

function drawSprite(store,palette,c,sprite,scale) {
    sprite.get('layers').forEach((layer) => {
        if(!layer.get('visible')) return;
        c.save();
        const w = store.getTileWidth(sprite)
        const h = store.getTileHeight(sprite)
        c.globalAlpha = layer.opacity;
        for(let y=0; y<h; y++) {
            for (let x = 0; x < w; x++) {
                const val = store.getPixelOnLayer(layer, x, y);
                if(val === -1) continue;
                c.fillStyle = store.lookupPaletteColor(palette, val);
                c.fillRect(x * scale, y * scale, scale, scale);
            }
        }
        c.restore();
    })
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
        const style = Object.assign(overrideStyle,{
            flex:0
        })
        if(this.state.open) {
            if(this.props.flex) style.flex = this.props.flex
            if(this.props.width) style.width = this.props.width
            if(this.props.width) style.minWidth = this.props.width
            return <VBox style={style}>
                    <HBox style={{backgroundColor:'black', color:'white'}}>
                        <button className="fa fa-chevron-down" onClick={this.toggleOpen}/>
                        {this.props.title}
                    </HBox>
                    {this.state.open?this.props.children:""}
                    <div>obottom</div>
                </VBox>

        } else {
            style.flex = 0
            style.minWidth = 'auto'
            style.width = 'auto'
            return <VBox style={style}>
                    <button className="fa fa-chevron-right" onClick={this.toggleOpen}/>
                </VBox>
        }
    }
}

class SceneEditorView extends CanvasComponent {
    constructor(props) {
        super(props)
        this.scale = 4
    }
    componentWillReceiveProps(props) {
        setTimeout(() => this.draw(),100)
    }
    mousedown = (pt,e) => {
        pt = pt.div(16).div(this.scale)
        this.props.store.setTileInScene(this.props.sheet,this.props.tile, Math.floor(pt.x), Math.floor(pt.y))
    }

    draw() {
        if(!this.canvas) return
        const c = this.canvas.getContext('2d')
        const scene = this.props.scene;
        scene.get('layers').forEach((layer)=>{
            if(!layer.get('visible')) return
            layer.get('tiles').forEach((tileRef)=>{
                const tileId = tileRef.get('tileId')
                const sheetId = tileRef.get('sheetId')
                const doc = this.props.store.getDoc()
                const sheet = doc.get('sheets').find((sheet)=>sheet.get('id')===sheetId)
                const palette = sheet.get('palette')
                const tile = sheet.get('tiles').find((tile)=>tile.get('id')===tileId)
                c.save();
                const tx = tileRef.get('x')*this.scale*16
                const ty = tileRef.get('y')*this.scale*16
                c.translate(tx,ty)
                drawSprite(this.props.store,palette,c,tile,this.scale)
                c.strokeStyle = 'black'
                c.strokeRect(0,0,this.scale*16,this.scale*16)
                c.restore()
            })
        })
    }

    render() {
        const overrideStyle = this.props.style?this.props.style:{}
        const style = Object.assign(overrideStyle,{})
        return <canvas
            style={style}
            ref={(can)=>this.canvas = can}
            width={this.scale*IS.getSceneWidth(this.props.scene)*16}
            height={this.scale*IS.getSceneHeight(this.props.scene)*16}
            onMouseDown={(e) => this.mousedown(this.toCanvas(e),e)}
            onMouseMove={this.mousemove}
            onMouseUp={this.mouseup}
        />
    }
}