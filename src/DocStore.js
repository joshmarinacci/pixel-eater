import BitmapModel from "./BitmapModel.js";
import {PALETTES} from './palettes.js'

export const MAX_THUMB_DIM = 128
function calcScale(model) {
    let scale = 1
    if(model.getWidth()*scale > MAX_THUMB_DIM || model.getHeight()*scale > MAX_THUMB_DIM) {
        let larger = Math.max(model.getWidth(), model.getHeight())
        let scale = 1/larger * MAX_THUMB_DIM
        let width = model.getWidth()*scale
        let height = model.getHeight()*scale
        let out = { width, height, scale}
        return out
    }


    while(true) {
        let sc2 = scale+1
        let larger = Math.max(model.getWidth()*sc2, model.getHeight()*sc2)
        if(larger > MAX_THUMB_DIM) break;
        scale = sc2
    }

    let out = {
        width:model.getWidth()*scale,
        height:model.getHeight()*scale,
        scale:scale
    }

    return out
}

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
            let {width,height, scale} = calcScale(doc.model)
            canvas.width = width
            canvas.height = height
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
