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
for(let i=0; i<16*16; i++) empty[i] = 0;
let EMPTY = new List(empty)


const layer1 = new Map({
    visible:true,
    pixels:EMPTY.set(0,1)
})
const tile1 = new Map({
    layers:new List([layer1])
})
const tile2 = new Map({
    layers: new List([])
})

const palette = new Map({
    name:'NES',
    id:genID(),
    colors:new List(['#FFFFFF', '#000000'])
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
        console.log("undo buffer length",this.undoStack.length)
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

    setPixelOnTile(tile,x,y,index) {
        this.setDoc(this.doc.updateIn(['sheets',0,'tiles',0,'layers',0,'pixels',x+y*16], value => index))
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

}

