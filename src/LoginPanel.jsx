import React, {Component} from "react";
import UserStore from "./UserStore";
import {Dialog, Spacer} from "appy-comps";


export default class LoginPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorText:""
        }
    }
    tryLogin(e) {
        e.stopPropagation();
        let data = {
            username: this.refs.username.value,
            password: this.refs.password.value
        };
        UserStore.login(data, (err,user) => {
            if(err) {
                this.setState({errorText: err.message});
            } else {
                this.props.onCompleted(user);
            }
        });
    }
    render() {
        return <Dialog visible={this.props.visible}>
            <header>Login</header>
            <div className="vbox form">
                <div className="hbox">
                    <label>username</label>
                    <input type="text" ref="username"/><br/>
                </div>
                <div className="hbox">
                    <label>password</label>
                    <input type="password" ref="password"/><br/>
                </div>
                <div className="hbox">
                    <label className="error">{this.state.errorText}</label>
                </div>
            </div>
            <footer className="children-right">
                <button className="primary" onClick={this.props.switchToRegister}>Register!</button>
                <Spacer/>
                <button onClick={this.props.onCanceled}>Cancel</button>
                <button className="primary" onClick={this.tryLogin.bind(this)}>Login</button>
            </footer>
        </Dialog>
    }
}
