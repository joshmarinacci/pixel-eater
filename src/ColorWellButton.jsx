import React, {Component} from "react";
import {PopupManager} from "appy-comps";

export default class ColorWellButton extends Component {
    clicked = () => {
        PopupManager.show(this.props.content,this.refs.button);
    }
    render() {
        return (<button ref='button' className="color-well "
                        style={{
                       backgroundColor:this.props.lookupColor(this.props.selectedColor),
                       position:'relative'
                        }}
                        onClick={this.clicked}
        ><i className="fa fa-fw"/></button>);
    }
}
