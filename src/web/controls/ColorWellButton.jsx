import React from "react";

import PopupContainer from "./PopupContainer.jsx"

export default class ColorWellButton extends React.Component {
    clicked() {
        this.refs.popup.open();
    }
    render() {
        return (<button className="color-well "
                        style={{
                       backgroundColor:this.props.model.lookupCanvasColor(this.props.selectedColor),
                       position:'relative'
                        }}
                        onClick={this.clicked.bind(this)}
        ><i className="fa fa-fw"></i><PopupContainer ref="popup">{this.props.children}</PopupContainer>
        </button>);
    }
}
