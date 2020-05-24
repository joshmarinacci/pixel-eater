import {GET_JSON, POST_JSON} from "./u";
import BitmapModel from "./BitmapModel.js";
import Config from "./Config";
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
    save(doc) {
        doc.version = "2";
        return POST_JSON(Config.url("/save"),doc);
    }
    loadDocList() {
        return GET_JSON(Config.url("/listfull"));
    }
    loadDoc(id) {
        return POST_JSON(Config.url("/load"), {id:id}).then((res) => {
            let doc = {
                id: res.doc.id,
                title: res.doc.title
            };
            if(res.doc.version === '1') {
                doc.model = BitmapModel.fromJSONV1(res.doc.model);
            }
            if(res.doc.version === '2') {
                doc.model = BitmapModel.fromJSON(res.doc.model);
            }
            this.setDoc(doc);
            return doc;
        });
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
                }
            }
        }
    }
    deleteDoc(id) {
        return POST_JSON(Config.url("/delete"), {id:id});
    }
}
export default new DocStore()
