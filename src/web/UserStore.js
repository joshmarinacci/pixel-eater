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
        console.log("doing a proper submit",data);
        POST_JSON("http://localhost:30065/login",data,function(err,val){
            console.log("got back",err,val);
            if(err.account) {
                console.log("logged in okay!");
                GET_JSON("http://localhost:30065/docs",function(err,val) {
                    console.log("docs = ", err,val);
                });
                GET_JSON("http://localhost:30065/whoami", function(err,val) {
                    console.log("I am",err.user.username);
                    self.user = err.user;
                    if(cb)cb(err.user);
                })
            }
        })
    }

    getUser() {
        return this.user;
    }
}

export default UserStore;