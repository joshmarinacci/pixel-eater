/*
 * document
  * sheets
   * tiles
   * scenes
  * palettes

 */
import {List, Map} from "immutable";

function genID() {
    return "id_"+Math.floor(Math.random()*100000)
}

const empty = [];
for(let i=0; i<16*16; i++) empty[i] = -1;
let EMPTY = new List(empty)

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

const layer1 = makeLayer()
const layer1b = makeLayer()
const layer2 = makeLayer()

const tile1 = new Map({
    layers:new List([layer1])//, layer1b])
})
const tile2 = new Map({
    layers: new List([layer2])
})

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

const sheet = new Map({
    name:'Sheet 1',
    id:genID(),
    tiles:new List([tile1, tile2]),
    palette:palette
})


const doc = new Map({
    sheets:new List([sheet]),
    palettes:new List([palette])
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
    undoCommand() {
        if(this.undoStack.length < 1) return  //don't undo if only one item in the stack
        this.undoStack.pop()
        this.doc = this.undoStack[this.undoStack.length-1]
        this.listeners.forEach((cb)=>cb?cb(this.doc):null)
    }

    getLayers(tile) {
        return tile.get('layers')
    }

    setPixelOnTile(tile,layer,x,y,value) {
        const layer_index = tile.get('layers').indexOf(layer)
        const path = this.findTilePath(tile).concat(['layers',layer_index,'pixels',x+y*16])
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
    addTileToSheet(sheet) {
        const layer = makeLayer()
        const tile = new Map({
            layers:new List([layer])
        })
        this.setDoc(this.doc.updateIn(['sheets',0,'tiles'], (tiles)=>tiles.push(tile)))
    }
    removeTileFromSheet(sheet, tile) {
        this.setDoc(this.doc.updateIn(['sheets',0,'tiles'], (tiles)=>tiles.filter(test=>test!==tile)))
    }
    findTilePath(tile) {
        let path = ['sheets',0,'tiles']
        return path.concat([this.doc.getIn(path).indexOf(tile)])
    }
    addLayerToTile(tile) {
        const layer = makeLayer()
        const path = this.findTilePath(tile).concat(['layers'])
        this.setDoc(this.doc.updateIn(path,(layers)=>layers.push(layer)))
    }
    toggleLayerVisibility(tile,layer) {
        const layer_index = tile.get('layers').indexOf(layer)
        const path = this.findTilePath(tile).concat(['layers',layer_index,'visible'])
        const oldval = this.doc.getIn(path);
        this.setDoc(this.doc.setIn(path,!oldval))
    }

}

