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
import {Point} from './DrawingSurface.jsx'

class SelectionBounds {
    constructor(x,y,w,h, model) {
        this.x = x
        this.y = y
        this.w = w
        this.h = h
        this.model = model
    }
    position() {
        return Point.makePoint(this.x,this.y)
    }
    bounds() {
        return { w: this.w, h: this.h}
    }
    setFrame(p1, p2) {
        this.x = p1.x
        this.y = p1.y
        this.w = p2.x-p1.x
        this.h = p2.y-p1.y
    }
    shift(offset) {
        this.x += offset.x
        this.y += offset.y
        this.clip(this.model.pw, this.model.ph)
    }
    inside(pt) {
        if(pt.x < this.x) return false
        if(pt.y < this.y) return false
        if(pt.x >= this.x + this.w) return false
        if(pt.y >= this.y + this.h) return false
        return true
    }
    isDefault() {
        if(this.x !== 0) return false
        if(this.y !== 0) return false
        if(this.w !== this.model.pw) return false
        if(this.h !== this.model.ph) return false
        return true
    }

    clip(mw,mh) {
        mw -= this.x
        mh -= this.y
        if(this.w > mw) this.w = mw
        if(this.h > mh) this.h = mh
        if(this.x < 0) {
            this.w = this.w + this.x
            this.x = 0
        }
        if(this.y < 0) {
            this.h = this.h + this.y
            this.y = 0
        }
        if(this.w < 1) this.w = 1
        if(this.h < 1) this.h = 1
    }
}

export class Stamp {
    constructor(w,h,data) {
        this.w = w
        this.h = h
        this.data = data || []
    }
    get_xy(x,y) {
        if(x > this.w) throw new Error(`x too big ${x} ${this.w}`)
        if(y > this.h) throw new Error(`y too big ${y} ${this.h}`)
        let n = y*this.w + x
        if(n >= this.data.length) throw new Error(`xy outside data bounds ${x},${y} ${this.data.length}`)
        return this.data[n]
    }
    width() {
        return this.w
    }
    height() {
        return this.h
    }
}
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
        this.selection = new SelectionBounds(0,0,pw,ph, this);
        this.pattern = new Stamp(2,2, [2,3,3,2])
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

    //selection
    resetSelection() {
        this.selection.setFrame(Point.makePoint(0,0), Point.makePoint(this.pw,this.ph))
        this.fireUpdate();
    }
    positionSelection(pt) {
        this.selection.x = pt.x
        this.selection.y = pt.y
        this.fireUpdate()
    }
    shiftSelection(offset) {
        this.selection.shift(offset)
        this.fireUpdate()
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
    get_xy(x,y, layer) {
        return layer.data[x+y*this.pw];
    }
    set_xy(x,y, layer,v) {
        layer.data[x+y*this.pw] = v
    }
    // getPixel(x,y) {
    //     var layer = this.getCurrentLayer();
    //     return layer.data[x+y*this.pw];
    // }
    drawStamp(pt, stamp) {
        let layer = this.getCurrentLayer()
        this.stampOnLayer(pt,stamp,layer)
    }
    fillStamp(pt, stamp, pattern) {
        let layer = this.getCurrentLayer()
        for(let i=0; i<stamp.width(); i++) {
            for(let j=0; j<stamp.height(); j++) {
                let cur = stamp.get_xy(i,j)
                if(cur !== -1) {
                    let pt2 = Point.makePoint(i+pt.x,j+pt.y)
                    let c = pattern.get_xy(pt2.x%pattern.width(),pt2.y%pattern.height())
                    this.setData(pt2, c, layer)
                }
            }
        }

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
        return new Stamp(stamp.w,stamp.h,data)
    }
    make_stamp_from_selection() {
        let pos = this.selection.position()
        let bounds = this.selection.bounds()
        let layer = this.getCurrentLayer()
        return this.stampFromLayer(pos,bounds,layer);
    }
    stampOnLayer(pt,stamp,layer) {
        for(let i=0; i<stamp.w; i++) {
            for(let j=0; j<stamp.h; j++) {
                let pt2 = Point.makePoint(pt.x+i, pt.y+j)
                if(!this.selection.inside(pt2)) continue
                if(pt.x+i >= this.pw) continue;
                if(pt.x+i < 0) continue;
                if(pt.y+j >= this.ph) continue;
                if(pt.y+j < 0) continue;
                let ia = i + j * stamp.w
                let ib = (pt.x + i) + (pt.y + j) * this.pw
                layer.data[ib] = stamp.data[ia];
            }
        }
    }
    shiftLayers(pt) {
        this.layers.forEach((l) => this.shiftLayer(l,pt));
        this.fireUpdate();
    }
    shiftSelectedLayer(pt) {
        let layer = this.getCurrentLayer()
        this.shiftLayer(layer,pt);
        this.fireUpdate();
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

    // pattern
    setPattern(pattern) {
        this.pattern = pattern
        this.fireUpdate()
    }
    getPattern() {
        return this.pattern
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
        this.drawScaled(c,0,w*0,w,scale,false);
    }
    drawScaled(c,ox,oy,w,s) {
        c.save();
        c.translate(ox,oy);
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


    // algorithms

}


function is_valid(model, layer, pt, src_col, dst_col) {
    //if out of bounds, return
    if(pt.x < 0) return false
    if(pt.y < 0) return false
    if(pt.x >= model.getWidth()) return false
    if(pt.y >= model.getHeight()) return false
    //if not inside selection, return
    if(!model.selection.inside(pt)) return false
    let cur = model.getData(pt)
    //if not the target color, return
    if(cur !== src_col) return false
    return true
}

export function floodFill(model, layer, pt, src_col, dst_col) {
    if(!is_valid(model,layer,pt,src_col,dst_col)) return

    let q = []
    q.push(pt)

    while(q.length > 0) {
        let q2 = []
        q.forEach(pt => {
            //find the left and right most spots
            let left = pt.x
            while(model.get_xy(left-1,pt.y,layer) === src_col && left-1 >= 0) left--
            let right = pt.x
            while(model.get_xy(right+1,pt.y,layer) === src_col && right+1 < model.getWidth()) right++

            // set the span
            for(let i=left; i<=right; i++) {
                model.set_xy(i,pt.y,layer,dst_col)
                let north = Point.makePoint(i,pt.y-1)
                if(is_valid(model,layer, north, src_col, dst_col)) q2.push(north)
                let south = Point.makePoint(i,pt.y+1)
                if(is_valid(model,layer, south, src_col, dst_col)) q2.push(south)
            }
        })
        q = q2
    }
}
