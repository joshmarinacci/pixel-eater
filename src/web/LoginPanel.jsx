import React from "react";
import UserStore from "./UserStore";

export default class LoginPanel extends React.Component {
    tryLogin(e) {
        e.stopPropagation();
        var self = this;
        var data = {
            username: this.refs.username.value,
            password: this.refs.password.value
        };
        UserStore.login(data, function(user){
            self.props.onCompleted(user);
        });
    }
    render() {
        return <div className="body">
            <div className="hbox">
                <label>username</label><input type="text" ref="username"/><br/>
            </div>
            <div className="hbox">
                <label>password</label><input type="password" ref="password"/><br/>
            </div>
            <div className="hbox right">
                <button onClick={this.props.onCanceled}>Cancel</button>
                <button className="primary" onClick={this.tryLogin.bind(this)}>Login</button>
                <label> </label>
                <button className="primary" onClick={this.props.switchToRegister}>Register!</button>
            </div>
        </div>
    }
}
