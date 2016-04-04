/**
 * Created by josh on 3/20/16.
 */

export default class BitmapModel {

    constructor(pw, ph) {
        this.pw = pw;
        this.ph = ph;
        this.data = [];
        this.fillData(this.data,this.pw*this.ph,0);
        this.cbs = [];
        this.palette = [
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
        this.command_buffer = [];
        this.command_index = 0;
    }

    toJSON() {
        return {
            width:this.pw,
            height:this.ph,
            data:this.data,
            palette:this.palette
        }
    }

    static fromJSON(json) {
        var model = new BitmapModel(json.width,json.height);
        model.data = json.data;
        return model;
    }

    fillData(array, len, val) {
        for(let i=0; i<len; i++) {
            array[i] = val;
        }
    }
    setData(point, val) {
        var n = point.x + point.y*16;
        this.data[n] = val;
        this.fireUpdate();
    }
    getData(point) {
        return this.data[point.x+point.y*16];
    }

    fireUpdate() {
        this.cbs.forEach(function(cb) {
            cb(this);
        })
    }

    changed(cb) {
        this.cbs.push(cb);
        return cb;
    }

    unlisten(cb) {
        var n = this.cbs.indexOf(cb);
        this.cbs.splice(n,1);
    }

    getWidth() {
        return this.pw;
    }

    getHeight() {
        return this.ph;
    }

    getPixel(x,y) {
        return this.data[x+y*16];
    }

    setPixel(pt, new_color){
        var old_color = this.getData(pt);
        this.setData(pt,new_color);
        this.appendCommand(
            () => this.setData(pt, old_color),
            () => this.setData(pt, new_color)
        );
    }
    appendCommand(undo,redo) {
        var newbuff = this.command_buffer.slice(0,this.command_index);
        newbuff.push({undo:undo,redo:redo});
        this.command_buffer = newbuff;
        this.command_index= this.command_index+1;
        this.fireUpdate();
    }
    lookupCanvasColor(val) {
        return this.palette[val];
    }

    getPalette() {
        return this.palette;
    }


    // undo / redo implementation
    isUndoAvailable() {
        return this.command_index > 0;
    }
    execUndo() {
        var cmd = this.command_buffer[this.command_index-1];
        cmd.undo();
        this.command_index = this.command_index - 1;
    }
    isRedoAvailable() {
        return this.command_index < this.command_buffer.length;
    }
    execRedo() {
        var cmd = this.command_buffer[this.command_index];
        cmd.redo();
        this.command_index = this.command_index + 1;
    }

}
