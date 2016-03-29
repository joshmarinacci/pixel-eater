import {GET_JSON, POST_JSON} from "./u";


export default {
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
        POST_JSON("http://localhost:30065/load", {id:id}, function(res) {
            if(cb)cb(res);
        })
    }
}
