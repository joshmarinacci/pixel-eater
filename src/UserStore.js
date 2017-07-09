/**
 * Created by josh on 3/28/16.
 */
import {GET_JSON, POST_JSON} from "./u";
import Config from "./Config";

export default {
    login(data) {
        return POST_JSON(Config.url("/login"),data).then((val) => {
            console.log("got back",val);
            if(val.account) {
                console.log("logged in okay!");
                return GET_JSON(Config.url("/whoami")).then((data) => {
                    this.user = data.user;
                    return data.user;
                })
            } else {
                return val;
            }
        })
    },

    checkLoggedIn() {
        return GET_JSON(Config.url('/whoami')).then((data) => {
            console.log("got the data",data);
            this.user = data.user;
            return data.user;
        });
    },

    getUser() {
        return this.user;
    },

    logout() {
        return POST_JSON(Config.url("/logout"),{}).then((val) => {
            this.user = null;
            return null;
        });
    },

    register(email,password,cb) {
        var obj = {
            email:email,
            password:password,
        };
        return POST_JSON(Config.url("/register"),obj).then((val) => {
            if(val.account) {
                this.user = val.account;
            }
        })
    }
}

