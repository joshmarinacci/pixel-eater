import {GET_JSON, POST_JSON} from "./u";
import BitmapModel from "./BitmapModel.js";
import Config from "./Config";


export default {
    doc: {
        model: new BitmapModel(16,16),
        title:"new doc",
        id:null
    },
    cbs:[],
    getDoc() {
        return this.doc;
    },
    fireUpdate() {
        this.cbs.forEach((cb) => cb(this));
    },
    changed(cb) {
        this.cbs.push(cb);
        return cb;
    },
    setDoc(doc) {
        this.doc = doc;
        this.fireUpdate();
    },
    save: function(doc) {
        doc.version = "2";
        return POST_JSON(Config.url("/save"),doc);
    },
    loadDocList:function() {
        return GET_JSON(Config.url("/listfull"));
    },
    loadDoc: function(id) {
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
    },
    newDoc: function() {
        return {
            model: new BitmapModel(16,16),
            title:"Untitled Artwork",
            id:null
        }
    },
    deleteDoc: function(id) {
        return POST_JSON(Config.url("/delete"), {id:id});
    }
}
