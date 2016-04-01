/**
 * Created by josh on 3/28/16.
 */
import {GET_JSON, POST_JSON} from "./u";
import Config from "./Config";

var _userStore;
class UserStore {
    static init() {
        if(!_userStore) _userStore = new UserStore();
        return _userStore;
    }

    login(data, cb) {
        var self = this;
        POST_JSON(Config.url("/login"),data,function(val){
            console.log("got back",val);
            if(val.account) {
                console.log("logged in okay!");
                GET_JSON(Config.url("/whoami"), function(data) {
                    self.user = data.user;
                    if(cb)cb(data.user);
                })
            }
        })
    }

    checkLoggedIn(cb) {
        var self = this;
        GET_JSON(Config.url('/whoami'), function(data) {
            console.log("got the data",data);
            self.user = data.user;
            if(cb)cb(data.user);
        });
    }

    getUser() {
        return this.user;
    }

    logout(cb) {
        var self = this;
        POST_JSON(Config.url("/logout"),{},function(val){
            self.user = null;
            if(cb) cb();
        });
    }

    register(email,password,cb) {
        var obj = {
            email:email,
            password:password,
        };
        var self = this;
        POST_JSON(Config.url("/register"),obj,function(val) {
            if(val.account) {
                self.user = val.account;
                if(cb) cb(null, val);
            } else {
                if(cb) cb(val,null);
            }
        })
    }
}

export default UserStore;