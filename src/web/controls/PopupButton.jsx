import React from "react";
import PopupContainer from "./PopupContainer.jsx";

export default class PopupButton extends React.Component {
    clicked() {
        this.refs.popup.open();
    }
    render() {
        return <button style={{ position: 'relative' }} onClick={this.clicked.bind(this)}>
            {this.props.caption}
            <PopupContainer ref="popup">{this.props.children}</PopupContainer>
        </button>
    }
}
