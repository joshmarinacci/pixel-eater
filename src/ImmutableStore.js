/*
 * document
  * sheets
   * tiles
   * scenes
  * palettes

 */
import {List, Map, fromJS} from "immutable";

function genID() {
    return "id_"+Math.floor(Math.random()*100000)
}

const empty = [];
for(let i=0; i<16*16; i++) empty[i] = -1;
let EMPTY = new List(empty)
const PALETTE =  [
    '#7C7C7C',
    '#0000FC',
    '#0000BC',
    "#4428BC",
    "#940084",
    "#A80020",
    "#A81000",

    "#881400",
    "#503000",
    "#007800",
    "#006800",
    "#005800",
    "#004058",

    "#000000",
    "#000000",
    "#000000",
    "#BCBCBC",
    "#0078F8",
    "#0058F8",


    "#6844FC",
    "#D800CC",
    "#E40058",
    "#F83800",
    "#E45C10",
    "#AC7C00",
    "#00B800",
    "#00A800",
    "#00A844",
    "#008888",
    "#000000",
    "#000000",
    "#000000",
    "#F8F8F8",
    "#3CBCFC",
    "#6888FC",
    "#9878F8",
    "#F878F8",
    "#F85898",
    "#F87858",
    "#FCA044",
    "#F8B800",
    "#B8F818",
    "#58D854",
    "#58F898",
    "#00E8D8",
    "#787878",
    "#000000",
    "#000000",
    "#FCFCFC",
    "#A4E4FC",
    "#B8B8F8",
    "#D8B8F8",
    "#F8B8F8",
    "#F8A4C0",
    "#F0D0B0",
    "#FCE0A8",
    "#F8D878",
    "#D8F878",
    "#B8F8B8",
    "#B8F8D8",
    "#00FCFC",
    "#F8D8F8",
    "#000000",
    "#000000"
]
const palette = new Map({
    name:'NES',
    id:genID(),
    colors:new List(PALETTE)
})

function makeLayer() {
    return new Map({
        visible:true,
        opacity:1.0,
        id:genID(),
        title:'a layer',
        pixels:EMPTY,
        width:16,
        height:16
    })
}
function makeTile() {
    return new Map({
        id:genID(),
        layers:new List([makeLayer()])
    })
}
function makeSheet() {
    return new Map({
        name:'unnamed sheet',
        id:genID(),
        tiles: new List([makeTile()]),
        palette: palette
    })
}
const s1 = makeSheet()

const scene = new Map({ //scene
    name:'scene 1',
    width:4,
    height:4,
    layers:new List([
        new Map({ // layer
            visible: true,
            id: genID(),
            tiles: List([ // tile reference
                new Map({
                    sheetId:s1.get('id'),
                    tileId:s1.get('tiles').get(0).get('id')
                })
            ])
        })
    ])
})

const doc = new Map({
    meta:new Map({
        format:'PixelEater:sprite-sheet-collection',
        version:1
    }),
    sheets:new List([s1]),
    palettes:new List([palette]),
    scenes:new List([scene])
})

export default class  ImmutableStore {
    constructor() {
        this.doc = doc
        this.listeners = []
        this.undoStack = [this.doc];
    }
    on(type, cb) {
        this.listeners.push(cb)
    }
    getDoc() {
        return this.doc
    }

    setDoc(doc) {
        this.doc = doc
        this.undoStack.push(doc)
        // console.log("undo buffer length",this.undoStack.length)
        this.listeners.forEach((cb)=>cb?cb(this.doc):null)
    }
    setDocFromObject(obj) {
        this.setDoc(fromJS(obj))
    }
    undoCommand() {
        if(this.undoStack.length < 1) return  //don't undo if only one item in the stack
        this.undoStack.pop()
        this.doc = this.undoStack[this.undoStack.length-1]
        this.listeners.forEach((cb)=>cb?cb(this.doc):null)
    }

    addSheetToDoc() {
        this.setDoc(this.doc.updateIn(['sheets'], sheets => sheets.push(makeSheet())))
    }
    removeSheetFromDoc(sheet) {
        this.setDoc(this.doc.updateIn(['sheets'], sheets => sheets.filter(sh => sh !== sheet)))
    }

    getLayers(tile) {
        return tile.get('layers')
    }

    setPixelOnTile(sheet,tile,layer,x,y,value) {
        const layer_index = tile.get('layers').indexOf(layer)
        const path = this.findTilePath(sheet,tile).concat(['layers',layer_index,'pixels',x+y*16])
        this.setDoc(this.doc.setIn(path, value))
    }
    setStampOnTile(tile,layer,x,y,stamp) {
        const layer_index = tile.get('layers').indexOf(layer)
        const path = this.findTilePath(tile).concat(['layers',layer_index,'pixels'])
        this.setDoc(this.doc.updateIn(path,(pixels)=>{
            for(let i=0; i<stamp.w; i++) {
                for(let j=0; j<stamp.h; j++) {
                    if(x+i >= layer.get('width')) continue;
                    if(x+i < 0) continue;
                    if(y+j >= layer.get('height')) continue;
                    if(y+j < 0) continue;
                    let ia = i + j*stamp.w;
                    let ib = x+i + (y+j)*layer.get('width')
                    const val = stamp.data[ia]
                    pixels = pixels.set(ib,val)
                }
            }
            return pixels
        }))

    }
    getPixelOnLayer(layer,x,y) {
        return layer.get('pixels').get(x + y * 16)
    }
    getTileWidth(tile) {
        return 16
    }
    getTileHeight(tile) {
        return 16
    }
    lookupPaletteColor(palette, val) {
        return palette.get('colors').get(val)
    }

    findSheetPath(sheet) {
        return ['sheets',this.doc.get('sheets').indexOf(sheet)]
    }
    findTilePath(sheet,tile) {
        let path = this.findSheetPath(sheet).concat(['tiles'])
        return path.concat([this.doc.getIn(path).indexOf(tile)])
    }

    addTileToSheet(sheet) {
        const path = this.findSheetPath(sheet).concat(['tiles'])
        this.setDoc(this.doc.updateIn(path, (tiles)=>tiles.push(makeTile())))
    }
    removeTileFromSheet(sheet, tile) {
        const path = this.findSheetPath(sheet).concat(['tiles'])
        this.setDoc(this.doc.updateIn(path, (tiles)=>tiles.filter(test=>test!==tile)))
    }
    addLayerToTile(sheet,tile) {
        const layer = makeLayer()
        const path = this.findTilePath(sheet,tile).concat(['layers'])
        this.setDoc(this.doc.updateIn(path,(layers)=>layers.push(layer)))
    }
    toggleLayerVisibility(sheet,tile,layer) {
        const layer_index = tile.get('layers').indexOf(layer)
        const path = this.findTilePath(sheet,tile).concat(['layers',layer_index,'visible'])
        const oldval = this.doc.getIn(path);
        this.setDoc(this.doc.setIn(path,!oldval))
    }


    getDefaultScene() {
        return this.doc.get('scenes').get(0)
    }
    getSceneWidth(scene) {
        return scene.get('width')
    }
    getSceneHeight(scene) {
        return scene.get('height')
    }
    getSceneLayers(scene) {
        return scene.get('layers')
    }
    forEachTileInSceneLayer(scene,layer,cb) {
        const w = this.getSceneWidth(scene)
        const h = this.getSceneHeight(scene)
        for(let x=0; x<w; x++) {
            for(let y=0; y<h; y++) {
                const index = x+y*w
                if(index >= layer.get('tiles').size) continue
                const tileRef = layer.get('tiles').get(index)
                if(!tileRef) continue
                const tileId = tileRef.get('tileId')
                const sheetId = tileRef.get('sheetId')
                const doc = this.getDoc()
                const sheet = doc.get('sheets').find((sheet)=>sheet.get('id')===sheetId)
                const tile = sheet.get('tiles').find((tile) => tile.get('id') === tileId)
                const palette = sheet.get('palette')
                cb(tile,palette,x,y)
            }
        }
    }
    setTileInScene(scene,sheet,tile,pt) {
        const tileRef = new Map({sheetId:sheet.get('id'),tileId:tile.get('id')})
        const path = ['scenes',0,'layers',0,'tiles']
        const index = pt.x + pt.y*this.getSceneWidth(scene)
        this.setDoc(this.doc.updateIn(path, tiles => tiles.set(index,tileRef)))
    }
    removeTileInScene(scene,pt) {
        const path = ['scenes',0,'layers',0,'tiles']
        const index = pt.x + pt.y*this.getSceneWidth(scene)
        this.setDoc(this.doc.updateIn(path, tiles => tiles.set(index,null)));
    }
}

