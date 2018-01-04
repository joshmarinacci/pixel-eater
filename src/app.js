import React, {Component} from 'react'
import DrawingSurface from './DrawingSurface.jsx'
import LayersPanel from './LayersPanel.jsx'
import ColorPicker from './ColorPicker.jsx'
import ToggleButton from './ToggleButton.jsx'
import ColorWellButton from './ColorWellButton.jsx'
import AlertPanel from './AlertPanel.jsx'
import {DialogContainer, DialogManager, HBox, PopupContainer, Spacer, VBox, VToggleGroup, HToggleGroup} from 'appy-comps'
import {KEYBOARD} from './u'
import {EraserTool, EyedropperTool, FillTool, LineTool, MoveTool, PencilTool} from './Tools'
import 'font-awesome/css/font-awesome.css'
import './web/components.css'
import 'appy-style/src/look.css'

import ImmutableStore from './ImmutableStore'
import SimpleList from './SimpleList'
import SceneEditorView from './SceneEditorView'
import CollapsingPanel from './CollapsingPanel'
import TileView from "./TileView"
import {drawSprite} from './GraphicsUtils'

const IS = new ImmutableStore()

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

const RecentColorRenderer = (props) => {
    const color = IS.lookupPaletteColor(props.palette, props.item)
    return <div style={{backgroundColor:color, width:'32px', height:'32px', border:'1px solid black', margin:'1px'}} onClick={()=>props.onClick(props.item)}></div>
}

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
                icon:'paint-brush',
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
                tool: new LineTool(this),
                tooltip:'Line',
                icon:'line-chart',
                keyCode: KEYBOARD.L
            },
            {
                tool: new FillTool(this),
                tooltip:'Fill',
                icon:'bitbucket',
                keyCode: KEYBOARD.F
            },
            {
                tool: new MoveTool(this),
                tooltip:'Move Layer(s)',
                icon:'arrows',
                keyCode: KEYBOARD.V
            },
        ];

        this.sceneTools = [
            {
                name:'draw',
                tooltip:'Draw',
                icon:'pencil'
            },
            {
                name:'erase',
                tooltip:'Eraser',
                icon:'eraser',
            }
        ]

        this.state = {
            doc: IS.getDoc(),
            drawGrid:true,
            drawSceneGrid:true,
            selectedColor:1,
            selectedSheetIndex: 0,
            selectedTileIndex: 0,
            selectedLayerIndex: 0,
            selectedTool:this.tools[0],
            selectedSceneTool:this.sceneTools[0],
            scale: 5,
            recentColors:[]
        };

        this.zoomIn  = () => this.setState({scale:this.state.scale+1})
        this.zoomOut = () => this.setState({scale:this.state.scale-1})

        this.undoCommand = () => IS.undoCommand()
        this.redoCommand = () => IS.redoCommand()

        this.getSelectedSheet = () => IS.getDoc().get('sheets').get(0)
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
        this.selectSceneTool = (tool) => this.setState({selectedSceneTool:tool})
        this.toggleGrid = () => this.setState({drawGrid: !this.state.drawGrid});
        this.toggleSceneGrid = () => this.setState({drawSceneGrid: !this.state.drawSceneGrid})

        this.showError = (txt) => {
            DialogManager.show(<AlertPanel
                text={txt}
                okayText="Okay"
                onOkay={()=> DialogManager.hide()}
                />);
        };

        this.selectColor = (color) => this.setState({selectedColor:color});
        this.getColorAtPixel = (pt) => IS.getPixelOnLayer(this.getSelectedLayer(),pt.x,pt.y)
        this.setColorAtPixel = (pt, color) => IS.setPixelOnTile(this.getSelectedTile(),this.getSelectedLayer(),pt.x,pt.y,color)
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
        this.appendRecentColor(new_color);
    }
    appendRecentColor(color) {
        const n = this.state.recentColors.indexOf(color)
        if(n < 0) {
            const colors = this.state.recentColors.slice()
            colors.push(color)
            this.setState({recentColors:colors})
        }
    }
    canvasKeyDown = (e) => {
        let tool = this.tools.find((tool) => e.keyCode === tool.keyCode);
        if(tool) this.selectTool(tool);
    }
    exportDocument = () => {
        const json = IS.getDoc().toJSON()
        const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(json))
        window.open(dataStr)
    }
    importDocument = (e) => {
        const selectedFile = document.getElementById('fileimport').files[0]
        const fr = new FileReader()
        fr.onload = function(e) { IS.setDocFromObject(JSON.parse(fr.result)) }
        fr.readAsText(selectedFile)
    }
    exportSprite = (scale) => {
        const canvas = document.createElement('canvas')
        canvas.width = 16*scale
        canvas.height = 16*scale
        const c = canvas.getContext('2d')
        const tile = this.getSelectedTile()
        const palette = this.getCurrentPalette()
        drawSprite(IS,palette,c,tile,scale)
        const url = canvas.toDataURL('PNG')
        window.open(url)
    }
    exportSheet = (scale) => {
        const canvas = document.createElement('canvas')
        const w = 4
        const h = 4
        canvas.width = 16*scale*w
        canvas.height = 16*scale*h
        const c = canvas.getContext('2d')
        const sheet = this.getSelectedSheet()
        const palette = this.getCurrentPalette()
        sheet.get('tiles').forEach((tile,i)=>{
            c.save()
            const x = (i%w)*16*scale
            const y = Math.floor(i/w)*16*scale
            console.log('translating',x,y)
            c.translate(x,y)
            drawSprite(IS,palette,c,tile,scale)
            c.restore()
        })
        const url = canvas.toDataURL('PNG')
        window.open(url)
    }

    render() {
        const gridStyle = {
            position:'absolute',
            top:0, bottom:0, right:0, left:0,
            display:'grid',
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
            <label htmlFor="fileimport">load</label>
            <input type="file" id="fileimport" onChange={this.importDocument}/>
            <button onClick={this.exportDocument}>save</button>
            <button onClick={()=>this.exportSheet(1)}>sheet x1</button>
            <button onClick={()=>this.exportSheet(4)}>sheet x4</button>
            <button onClick={()=>this.exportSprite(1)}>sprite x1</button>
            <button onClick={()=>this.exportSprite(4)}>sprite x4</button>
            <button onClick={()=>this.exportSprite(8)}>sprite x8</button>
            <Spacer/>
        </HBox>
    }

    renderDocSelector() {
        return <CollapsingPanel title="sheets" width='200px' style={{border:'1px solid #888', backgroundColor:'#dddddd'}}>
            <SimpleList
                list={IS.getDoc().get('sheets')}
                style={{flex:1}}
                orientation={'vertical'}
                renderer={SheetListItemRenderer}
                selectedItem={IS.getDoc().get('sheets').get(this.state.selectedSheetIndex)}
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
                    <VToggleGroup
                        list={this.tools}
                        selected={this.state.selectedTool}
                        template={ToggleButtonTemplate}
                        onChange={this.selectTool}/>
                    <ColorWellButton
                        lookupColor={(color)=> IS.lookupPaletteColor(this.getCurrentPalette(), color)}
                        selectedColor={this.state.selectedColor} content={cp}/>
                    <SimpleList
                        orientation="wrap"
                        list={this.state.recentColors}
                        palette={this.getCurrentPalette()}
                        onClick={this.selectColor}
                        renderer={RecentColorRenderer}
                    />
                </HBox>
                <HBox>
                    <button onClick={this.zoomIn} className="fa fa-search-plus"/>
                    <button onClick={this.zoomOut} className="fa fa-search-minus"/>
                    <button onClick={this.toggleGrid}>grid</button>
                    <button onClick={this.undoCommand} className="fa fa-undo"/>
                    <button onClick={this.redoCommand} className="fa fa-repeat"/>
                </HBox>
            </VBox>
        </CollapsingPanel>
    }
    renderDrawingSurface() {
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
                palette={this.getSelectedSheet().get('palette')}
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
            <div style={{overflow:'scroll', flex:1}}>
                <SceneEditorView store={IS}
                                 scene={IS.getDefaultScene()}
                                 tile={this.getSelectedTile()}
                                 sheet={this.getSelectedSheet()}
                                 showGrid={this.state.drawSceneGrid}
                                 tool={this.state.selectedSceneTool}
                />
            </div>
            <HBox>
                <label>selected tile</label>
                <TileView store={IS} sprite={this.getSelectedTile()} scale={1} palette={this.getCurrentPalette()}/>
                <label>width: 4</label>
                <label>height: 4 </label>
                <HToggleGroup
                    list={this.sceneTools}
                    selected={this.state.selectedSceneTool}
                    template={ToggleButtonTemplate}
                    onChange={this.selectSceneTool}/>
                <button onClick={this.toggleSceneGrid}>grid</button>
            </HBox>
        </CollapsingPanel>
    }

    renderBottomToolbar() {
        return <div className="border-top border-bottom border" style={{ gridColumn:'left/-1', gridRow:'statusbar/-1'}}>status bar</div>
    }
}



