import React, {Component} from "react";
import UserStore from "./UserStore";
import {Dialog, Spacer, VBox, HBox} from "appy-comps";


export default class LoginPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorText:""
        }
    }
    tryLogin(e) {
        e.stopPropagation();
        UserStore.login({
            username: this.refs.username.value,
            password: this.refs.password.value
            })
            .then((user) => this.props.onCompleted(user))
            .catch((e)=>  this.setState({errorText:e.message}));
    }
    render() {
        return <Dialog visible={true}>
            <header>Login</header>
            <VBox className="form">
                <HBox>
                    <label>username</label>
                    <input type="text" ref="username"/><br/>
                </HBox>
                <HBox>
                    <label>password</label>
                    <input type="password" ref="password"/><br/>
                </HBox>
                <HBox>
                    <label className="error">{this.state.errorText}</label>
                </HBox>
            </VBox>
            <footer className="children-right">
                <button className="primary" onClick={this.props.switchToRegister}>Register!</button>
                <Spacer/>
                <button onClick={this.props.onCanceled}>Cancel</button>
                <button className="primary" onClick={this.tryLogin.bind(this)}>Login</button>
            </footer>
        </Dialog>
    }
}
