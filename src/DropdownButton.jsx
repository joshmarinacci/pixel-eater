import React, {Component} from "react";
import {PopupManager} from "appy-comps";

export default class DropdownButton extends Component {

    constructor(props) {
        super(props);
        this.state = {
            open:false
        };
        this.toggle = () => PopupManager.show(this.props.children, this.refs.button);
    }

    render() {
        var icon = "";
        if(this.props.icon) icon = "fa fa-"+this.props.icon;
        return <button ref='button' tooltip="Export / Share" onClick={this.toggle}><i className={icon}/></button>
    }
}
