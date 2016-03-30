import {GET_JSON, POST_JSON} from "./u";
import BitmapModel from "./BitmapModel.js";


export default {
    doc: {
        model: new BitmapModel(16,16),
        title:"new doc",
        id:null
    },
    getDoc() {
        return this.doc;
    },
    setDoc(doc) {
        this.doc = doc;
    },
    getModel() {
        return this.doc.model;
    },
    save: function(doc, cb) {
        doc.version = "1";
        POST_JSON("http://localhost:30065/save",doc,function(res){
            if(cb)cb(res);
        });
    },
    loadDocList:function(cb) {
        GET_JSON("http://localhost:30065/listfull", function(res) {
            if(cb)cb(res);
        })
    },
    loadDoc: function(id,cb) {
        var self = this;
        POST_JSON("http://localhost:30065/load", {id:id}, function(res) {
            var doc = {
                model:BitmapModel.fromJSON(res.doc.model),
                id:res.doc.id,
                title:res.doc.title
            };
            self.doc = doc;
            if(cb)cb(doc);
        })
    },
    newDoc: function() {
        return {
            model: new BitmapModel(16,16),
            title:"Untitled Artwork",
            id:null
        }
    }
}
