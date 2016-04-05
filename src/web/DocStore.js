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
    save: function(doc, cb) {
        doc.version = "2";
        POST_JSON(Config.url("/save"),doc,(res) => {if(cb)cb(res);} );
    },
    loadDocList:function(cb) {
        GET_JSON(Config.url("/listfull"), (res) => {if(cb)cb(res)});
    },
    loadDoc: function(id,cb) {
        POST_JSON(Config.url("/load"), {id:id}, (res) => {
            console.log("res = ", res);
            var doc = {
                id:res.doc.id,
                title:res.doc.title
            };
            if(res.doc.version == '1') {
                doc.model = BitmapModel.fromJSONV1(res.doc.model);
            }
            if(res.doc.version == '2') {
                doc.model = BitmapModel.fromJSON(res.doc.model);
            }
            this.setDoc(doc);
            if(cb)cb(doc);
        });
    },
    newDoc: function() {
        return {
            model: new BitmapModel(16,16),
            title:"Untitled Artwork",
            id:null
        }
    }
}
