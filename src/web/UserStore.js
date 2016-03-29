/**
 * Created by josh on 3/28/16.
 */
import {GET_JSON, POST_JSON} from "./u";


var _userStore;
class UserStore {
    static init() {
        console.log("initted");
        if(!_userStore) _userStore = new UserStore();
        return _userStore;
    }

    login(data, cb) {
        var self = this;
        POST_JSON("http://localhost:30065/login",data,function(val){
            console.log("got back",val);
            if(val.account) {
                console.log("logged in okay!");
                GET_JSON("http://localhost:30065/whoami", function(data) {
                    self.user = data.user;
                    if(cb)cb(data.user);
                })
            }
        })
    }

    getUser() {
        return this.user;
    }
}

export default UserStore;