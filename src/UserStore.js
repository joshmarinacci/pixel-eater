/**
 * Created by josh on 3/28/16.
 */
import {GET_JSON, POST_JSON} from "./u";
import Config from "./Config";

export default {
    login(data, cb) {
        POST_JSON(Config.url("/login"),data,(val) => {
            console.log("got back",val);
            if(val.account) {
                console.log("logged in okay!");
                GET_JSON(Config.url("/whoami"), (data) => {
                    this.user = data.user;
                    if(cb)cb(null,data.user);
                })
            } else {
                if(cb) cb(val,null);
            }
        })
    },

    checkLoggedIn(cb) {
        GET_JSON(Config.url('/whoami'), (data) => {
            console.log("got the data",data);
            this.user = data.user;
            if(cb)cb(data.user);
        });
    },

    getUser() {
        return this.user;
    },

    logout(cb) {
        POST_JSON(Config.url("/logout"),{},(val) => {
            this.user = null;
            if(cb) cb();
        });
    },

    register(email,password,cb) {
        var obj = {
            email:email,
            password:password,
        };
        POST_JSON(Config.url("/register"),obj,(val) => {
            if(val.account) {
                this.user = val.account;
                if(cb) cb(null, val);
            } else {
                if(cb) cb(val,null);
            }
        })
    }
}

