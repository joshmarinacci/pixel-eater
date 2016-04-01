export default {
    BASE_URL:'http://localhost:30065',
    url:function(path) {
        return this.BASE_URL + path;
    }
}