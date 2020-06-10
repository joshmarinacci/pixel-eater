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

    saveThumbnail(doc, docserver) {
        return new Promise((res,rej)=>{
            let canvas = document.createElement('canvas')
            //draw a 2x scaled version
            let scale = 2
            canvas.width = doc.model.getWidth()*scale
            canvas.height = doc.model.getHeight()*scale
            doc.model.drawScaledCanvas(canvas,scale)
            function canvasToPNGBlob(canvas) {
                return new Promise((res,rej)=>{
                    canvas.toBlob((blob)=>{
                        res(blob)
                    },'image/png')
                })
            }
            canvasToPNGBlob(canvas).then((blob)=> {
                console.log("Got a blob",blob)
                let url = `${docserver.url}/docs/${docserver.getUsername()}/thumbnail/${doc.id}/version/image/png/${canvas.width}/${canvas.height}/thumbnail.png`
                let formdata = new FormData()
                formdata.append('thumbnail',blob)
                return docserver._fetch(url,{
                    method:'POST',
                    body:formdata,
                }).then(res=>res.json())
                    .then(json => res(json))
                    .catch(e => {
                        console.log("major error",e)
                    })

                // res(blob)
            })

        })
    }
}
export default new DocStore()
