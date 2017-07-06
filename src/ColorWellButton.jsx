import React, {Component} from "react";
import {PopupManager} from "appy-comps";

export default class ColorWellButton extends Component {
    clicked() {
        PopupManager.show(this.props.content,this.refs.button);
    }
    render() {
        return (<button ref='button' className="color-well "
                        style={{
                       backgroundColor:this.props.model.lookupCanvasColor(this.props.selectedColor),
                       position:'relative'
                        }}
                        onClick={this.clicked.bind(this)}
        ><i className="fa fa-fw"></i></button>);
    }
}
