import React, {Component} from "react";
import {Spacer, StandardDialog} from "appy-comps"

export default class AlertPanel extends Component {
    render() {
        return <StandardDialog visible={true}>
            <header>Alert</header>
            <main className="grow">{this.props.text}</main>
            <footer className="children-right">
                <Spacer/>
                {this.renderCancelButton()}
                {this.renderOkayButton()}
            </footer>
        </StandardDialog>
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

