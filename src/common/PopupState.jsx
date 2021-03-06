export default {
    cbs:[],
    done: function() {
        this.cbs.forEach(cb => cb());
    },
    open: function(src) {
        this.cbs.forEach(cb => cb(src));
    },
    listen: function(cb) {
        this.cbs.push(cb);
        return cb;
    },
    unlisten: function(cb) {
        var n = this.cbs.indexOf(cb);
        this.cbs.splice(n,1);
    }
};



