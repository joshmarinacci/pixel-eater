import React from "react";
import UserStore from "./UserStore";
import Dialog from "./Dialog.jsx";

export default class LoginPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            errorText:""
        }
    }
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
        return <Dialog visible={this.props.visible}>
            <header>Login</header>
            <div className="body">
                <div className="hbox">
                    <label>username</label><input type="text" ref="username"/><br/>
                </div>
                <div className="hbox">
                    <label>password</label><input type="password" ref="password"/><br/>
                </div>
                <div className="hbox">
                    <label className="error">{this.state.errorText}</label>
                </div>
            </div>
            <footer>
                <div className="hbox right">
                    <button onClick={this.props.onCanceled}>Cancel</button>
                    <button className="primary" onClick={this.tryLogin.bind(this)}>Login</button>
                    <label> </label>
                    <button className="primary" onClick={this.props.switchToRegister}>Register!</button>
                </div>
            </footer>
        </Dialog>
    }
}
