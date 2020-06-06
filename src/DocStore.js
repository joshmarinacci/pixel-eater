import BitmapModel from "./BitmapModel.js";
import {PALETTES} from './palettes.js'

class DocStore {
    constructor() {
        this.cbs = []
        this.doc = this.newDoc()
    }
    getDoc() {
        return this.doc;
    }
    fireUpdate() {
        console.log("firing update")
        this.cbs.forEach((cb) => cb(this));
        console.log("state doc is",this.doc.tools.pencil.state)
    }
    changed(cb) {
        this.cbs.push(cb);
        return cb;
    }
    setDoc(doc) {
        this.doc = doc;
        this.fireUpdate();
    }
    newDoc() {
        return {
            model: new BitmapModel(16,16, PALETTES.nes),
            title:"new doc",
            id:null,
            tools:{
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
    }
}
export default new DocStore()
