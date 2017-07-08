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
        let email = this.refs.email.value;
        let password = this.refs.password.value;
        UserStore.register(email,password,(err,user) => {
            if(err) {
                this.setState({errorText: err.message});
            } else {
                this.props.onCompleted(user);
            }
        })
    }
    render() {
        return <Dialog visible={true}>
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
