/**
 * Created by josh on 3/20/16.
 */

export default class BitmapModel {
    constructor(pw, ph) {
        this.pw = pw;
        this.ph = ph;
        this.data = [];
        this.fillData(this.data,this.pw*this.ph,0);
        this.data[2] = 1;
        this.data[122] = 1;
        this.cbs = [];
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

    fireUpdate() {
        this.cbs.forEach(function(cb) {
            cb(this);
        })
    }

    changed(cb) {
        this.cbs.push(cb);
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

    lookupCanvasColor(val) {
        if(val == 1) return 'green';
        return 'blue';
    }

}
