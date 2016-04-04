import React from "react";
import UserStore from "./UserStore";

export default class RegistrationPanel extends React.Component {
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
        return <div className="body">
            <div className="hbox">
                <label>email</label><input type="text" ref="email"/><br/>
            </div>
            <div className="hbox">
                <label>password</label><input type="text" ref="password"/><br/>
            </div>
            <div className="hbox">
                <label className="error">{this.state.errorText}</label>
            </div>
            <div className="hbox right">
                <button onClick={this.props.onCanceled}>Cancel</button>
                <button className="primary" onClick={this.tryRegister.bind(this)}>Login</button>
            </div>
        </div>
    }
}
