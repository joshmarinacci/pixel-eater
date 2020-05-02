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

    constructor(pw, ph, palette) {
        this.pw = pw;
        this.ph = ph;
        this.layers = [];
        this.layers.push(this._makeLayer())
        this.selectedLayerIndex = 0;
        this.bgcolor = 0;
        this.cbs = [];
        this.palette = palette
        this.command_buffer = [];
        this.command_index = 0;
    }

    // encoding

    toJSON() {
        return {
            width:this.pw,
            height:this.ph,
            layers: this.layers,
            bgcolor:this.bgcolor,
            palette:this.palette
        }
    }
    static fromJSON(json) {
        var model = new BitmapModel(json.width,json.height, json.palette);
        model.layers = json.layers;
        if(json.bgcolor) model.bgcolor = json.bgcolor;
        return model;
    }
    static fromJSONV1(json) {
        var model = new BitmapModel(json.width,json.height);
        var layer = {
            data: json.data,
            visible:true,
            title:'Layer 1',
            opacity: 1.0,
        };
        model.layers = [layer];
        return model;
    }

    // data access
    _fillData(array, len, val) {
        for(let i=0; i<len; i++) {
            array[i] = val;
        }
    }
    setData(point, val, layer) {
        if(!layer) return;
        var n = point.x + point.y*this.pw;
        layer.data[n] = val;
        this.fireUpdate();
    }
    getData(point) {
        var layer = this.getCurrentLayer();
        if(!layer) return null;
        return layer.data[point.x+point.y*this.pw];
    }
    getPixel(x,y) {
        var layer = this.getCurrentLayer();
        return layer.data[x+y*this.pw];
    }
    setPixel(pt, new_color){
        var old_color = this.getData(pt);
        var layer = this.getCurrentLayer();
        this.setData(pt,new_color,layer);
        this.appendCommand(
            () => this.setData(pt, old_color,layer),
            () => this.setData(pt, new_color,layer)
        );
    }
    drawStamp(pt, stamp) {
        var layer = this.getCurrentLayer();
        var oldStamp = this.stampFromLayer(pt,stamp,layer);
        let redo = () => {
            this.stampOnLayer(pt,stamp,layer);
            this.fireUpdate();
        };
        let undo = () => {
            this.stampOnLayer(pt,oldStamp,layer);
            this.fireUpdate();
        };
        redo();
        this.appendCommand(undo,redo);
    }
    stampFromLayer(pt,stamp,layer) {
        var data = [];
        for(var i=0; i<stamp.w; i++) {
            for(var j=0; j<stamp.h; j++) {
                var ia = i + j*stamp.w;
                var ib = (pt.x+i) + (pt.y+j)*this.pw;
                data[ia] = layer.data[ib];
                //layer.data[ib] = stamp.data[ia];
            }
        }
        return {
            w:stamp.w,
            h:stamp.h,
            data:data
        }
    }
    stampOnLayer(pt,stamp,layer) {
        for(var i=0; i<stamp.w; i++) {
            for(var j=0; j<stamp.h; j++) {
                if(pt.x+i >= this.pw) continue;
                if(pt.x+i < 0) continue;
                if(pt.y+j >= this.ph) continue;
                if(pt.y+j < 0) continue;
                var ia = i + j*stamp.w;
                var ib = (pt.x+i) + (pt.y+j)*this.pw;
                layer.data[ib] = stamp.data[ia];
            }
        }
    }
    shiftLayers(pt) {
        let redo = () => {
            this.layers.forEach((l) => this.shiftLayer(l,pt));
            this.fireUpdate();
        };
        let undo = () => {
            this.layers.forEach((l) => this.shiftLayer(l,{x:-pt.x, y:-pt.y}));
            this.fireUpdate();
        };
        redo();
        this.appendCommand(undo,redo);
    }
    shiftSelectedLayer(pt) {
        var layer = this.getCurrentLayer();
        let redo = () => {
            this.shiftLayer(layer,pt);
            this.fireUpdate();
        };
        let undo = () => {
            this.shiftLayer(layer,{x:-pt.x, y:-pt.y});
            this.fireUpdate();
        };
        redo();
        this.appendCommand(undo,redo);
    }
    shiftLayer(layer, off) {
        var data2 = [];
        this._fillData(data2,this.pw*this.ph,-1);
        for(var j=0; j<this.ph; j++) {
            for(var i=0; i<this.pw; i++) {
                var j2 = j-off.y;
                var i2 = i-off.x;
                if(j2 >= this.ph) j2-=this.ph;
                if(j2 < 0) j2+=this.ph;
                if(i2 >= this.pw) i2-=this.pw;
                if(i2 < 0) i2+=this.pw;

                var index1 = i+j*this.pw;
                var index2 = i2 + j2*this.pw;
                data2[index1] = layer.data[index2];
            }
        }
        layer.data = data2;
    }

    //structure
    getWidth() {
        return this.pw;
    }
    getHeight() {
        return this.ph;
    }
    getBackgroundColor() {
        return this.bgcolor;
    }
    setBackgroundColor(val) {
        this.bgcolor = val;
        this.fireUpdate();
    }
    resize(width,height) {
        console.log('resizing from', this.pw, this.ph, ' to ', width, height);
        var oldLayers = this.layers;
        var oldWidth = this.pw;
        var oldHeight = this.ph;

        let redo = () => {
            //TODO: should this be moved outside the redo function?
            this.layers = oldLayers.map((layer) => this._makeResizedLayer(layer,oldWidth,oldHeight,width,height));
            this.pw = width;
            this.ph = height;
            this.fireUpdate();
        };
        let undo = () => {
            this.layers = oldLayers;
            this.pw = oldWidth;
            this.ph = oldHeight;
            this.fireUpdate();
        };
        redo();
        this.appendCommand(undo,redo);
    }
    _makeResizedLayer(layer, ow, oh, nw, nh) {
        var data = [];
        this._fillData(data, nw * nh, -1);
        var nlayer = {
            data:    data,
            visible: layer.visible,
            opacity: layer.opacity,
            title:   layer.title
        };
        this._copyData(layer,0,0,ow,oh, nlayer,0,0,nw,nh);
        return nlayer;
    }
    _copyData(src, sx,sy,sw,sh, dst, dx,dy,dw,dh ) {
        for(let i=sx; i<sx+sw; i++) {
            for(let j=sy; j<sy+sh; j++) {
                dst.data[(j+dy)*dw+(i+dx)]= src.data[(j+sy)*sw+(i+sx)];
            }
        }
    }

    //events
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

    // layer stuff
    getLayers() {
        return this.layers;
    }
    getReverseLayers() {
        var sc = this.layers.slice();
        sc.reverse();
        return sc;
    }
    _makeLayer() {
        var data = [];
        this._fillData(data, this.pw * this.ph, -1);
        return {
            data: data,
            visible:true,
            opacity:1.0,
            title:'Layer ' + (this.layers.length+1)
        }
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
    getPixelFromLayer(x,y,layer) {
        return layer.data[x+y*this.pw];
    }
    setSelectedLayer(layer) {
        this.selectedLayerIndex = this.layers.indexOf(layer);
        this.fireUpdate();
    }
    appendLayer() {
        var layer = this._makeLayer();
        var newLayers = this.layers.slice();
        newLayers.push(layer);
        this.setLayers(newLayers);
        return layer;
    }
    setLayerOpacity(layer,value) {
        layer.opacity = value;
        this.fireUpdate()
    }
    setLayerTitle(layer, value) {
        layer.title = value;
        this.fireUpdate();
    }
    getLayerIndex(layer) {
        return this.layers.indexOf(layer);
    }
    moveLayerTo(layer,index) {
        var layers = this.layers.slice();
        var old = this.getLayerIndex(layer);
        layers.splice(old,1);
        layers.splice(index,0,layer);
        this.setLayers(layers);
    }
    setLayers(newLayers) {
        var oldLayers = this.layers;
        let redo = () => {
            this.layers = newLayers;
            this.fireUpdate();
        };
        let undo = () => {
            this.layers = oldLayers;
            this.fireUpdate();
        };
        redo();
        this.appendCommand(undo,redo);
    }
    deleteLayer(layer) {
        if(this.layers.length <= 1) return; //don't delete last layer
        var n = this.layers.indexOf(layer);
        if(n >= 0) {
            var newLayers = this.layers.slice();
            newLayers.splice(n,1);
            this.setLayers(newLayers);
        }
    }


    // palette
    lookupCanvasColor(val) {
        return this.palette[val];
    }
    getPalette() {
        return this.palette;
    }

    // undo / redo implementation
    appendCommand(undo,redo) {
        var newbuff = this.command_buffer.slice(0,this.command_index);
        newbuff.push({undo:undo,redo:redo});
        this.command_buffer = newbuff;
        this.command_index= this.command_index+1;
        this.fireUpdate();
    }
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


    drawScaledCanvas(canvas,scale) {
        let c = canvas.getContext('2d');
        let w = this.getWidth();
        c.fillStyle = 'white';
        c.fillRect(0,0,canvas.width,canvas.height);
        this.drawScaled(c,0,w*0,w,scale);
    }
    drawScaled(c,ox,oy,w,s) {
        c.save();
        c.translate(ox,oy);
        c.fillStyle = this.lookupCanvasColor(this.getBackgroundColor());
        c.fillRect(0,0,w*s,w*s);
        c.strokeStyle = 'black';
        c.strokeRect(0.5,0.5,w*s,w*s);
        this.getReverseLayers().map((layer) => this.drawLayer(c, layer,s, this));
        c.restore();
    }
    drawLayer(c,layer,sc, model) {
        if(!layer.visible) return;
        c.save();
        c.globalAlpha = layer.opacity;
        let w = model.getWidth();
        let h = model.getHeight();
        for(let y=0; y<h; y++) {
            for (let x = 0; x < w; x++) {
                let val = model.getPixelFromLayer(x, y, layer);
                if(val === -1) continue;
                c.fillStyle = model.lookupCanvasColor(val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }
        c.restore();
    }
}
