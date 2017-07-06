import React, {Component} from "react";
import UserStore from "./UserStore";
import {Dialog, HBox, VBox} from "appy-comps";

export default class RegistrationPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            errorText:""
        }
    }
    tryRegister(e) {
        var email = this.refs.email.value;
        var password = this.refs.password.value;
        var self = this;
        UserStore.register(email,password,function(err,user) {
            if(err) {
                self.setState({errorText: err.message});
            } else {
                self.props.onCompleted(user);
            }
        })
    }
    render() {
        return <Dialog visible={this.props.visible}>
            <header>Register</header>
            <VBox className="form">
                <HBox>
                    <label>email</label><input type="text" ref="email"/><br/>
                </HBox>
                <HBox>
                    <label>password</label><input type="text" ref="password"/><br/>
                </HBox>
                <HBox>
                    <label className="error">{this.state.errorText}</label>
                </HBox>
            </VBox>
            <footer className="children-right">
                <button onClick={this.props.onCanceled}>Cancel</button>
                <button className="primary" onClick={this.tryRegister.bind(this)}>Login</button>
            </footer>
        </Dialog>
    }
}
