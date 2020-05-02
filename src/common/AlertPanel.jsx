import React, {Component} from "react";
import {Dialog, VBox} from "appy-comps";

export default class AlertPanel extends Component {
    render() {
        return <Dialog visible={true}>
            <header>Alert</header>
            <VBox className="grow">{this.props.text}</VBox>
            <footer className="children-right">
                {this.renderCancelButton()}
                {this.renderOkayButton()}
            </footer>
        </Dialog>
    }

    renderCancelButton() {
        if (this.props.onCancel) return <button onClick={this.props.onCancel}>{this.props.cancelText}</button>
        return "";
    }

    renderOkayButton() {
        if(this.props.onOkay) return <button  onClick={this.props.onOkay} className="primary">{this.props.okayText}</button>
        return "";
    }
}

