/**
 * Created by josh on 3/20/16.
 *
 *
 new model. there are multiple layers
 each layer is the same size as the overall model.
 each layer has an attached opacity. there is no alpha channel since that doesn't make much sense for indexed colors (right?)
 setting the pixel automatically sets it on the currently selected layer
 model has a concept of the currently selected layer. stored and saved in the document
 can  add or remove layers
 also a background layer that you can't remove, but you can change the color or make it transparent
 pixel may have a value of 'transparent', which is -1 (right?)
 palette includes whether particular color is transparent or translucent or whatever.
 erasing chooses a transparent value from the palette?
 can't delete background layer. don't show the background layer in the list, instead have a button to pick the BG color from the palette, or choose transparent to show a checkerboard
 must always have at least one pixel layer

 layers can be moved up and down by dragging or with arrows. must be reversible
 selected layer(s) can be deleted by icon or delete key. must be reversible

 upgrade older versions of the format automatically.

 */

export default class BitmapModel {

    constructor(pw, ph) {
        this.pw = pw;
        this.ph = ph;
        this.layers = [];
        this.layers.push(this._makeLayer())
        this.selectedLayerIndex = 0;
        this.bgcolor = 0;
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

    _makeLayer() {
        var data = [];
        this.fillData(data, this.pw * this.ph, -1);
        return {
            data: data,
            visible:true,
            title:'Layer ' + (this.layers.length+1)
        }
    }

    toJSON() {
        return {
            width:this.pw,
            height:this.ph,
            layers: this.layers,
            palette:this.palette
        }
    }

    static fromJSON(json) {
        var model = new BitmapModel(json.width,json.height);
        model.layers = json.layers;
        return model;
    }
    static fromJSONV1(json) {
        var model = new BitmapModel(json.width,json.height);
        var layer = {
            data: json.data,
            visible:true,
            title:'Layer 1'
        };
        model.layers = [layer];
        return model;
    }

    fillData(array, len, val) {
        for(let i=0; i<len; i++) {
            array[i] = val;
        }
    }
    setData(point, val) {
        var layer = this.getCurrentLayer();
        var n = point.x + point.y*16;
        layer.data[n] = val;
        this.fireUpdate();
    }
    getData(point) {
        var layer = this.getCurrentLayer();
        return layer.data[point.x+point.y*16];
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


    getLayers() {
        return this.layers;
    }

    getReverseLayers() {
        var sc = this.layers.slice();
        sc.reverse();
        return sc;
    }

    getCurrentLayer() {
        return this.layers[this.selectedLayerIndex];
    }
    isLayerVisible(layer) {
        return layer.visible;
    }
    setLayerVisible(layer, val) {
        layer.visible = val;
    }

    getPixel(x,y) {
        var layer = this.getCurrentLayer();
        return layer.data[x+y*16];
    }
    getPixelFromLayer(x,y,layer) {
        return layer.data[x+y*16];
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

    setSelectedLayer(layer) {
        this.selectedLayerIndex = this.layers.indexOf(layer);
        this.fireUpdate();
    }

    appendLayer() {
        this.layers.push(this._makeLayer());
        this.fireUpdate();
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
