import React, {Component} from "react";
import {Dialog, VBox, HBox} from "appy-comps";
import Config from "./Config"


export default class SharePanel extends Component {
    generateURL() {
        return Config.url("/preview/")
            + this.props.id
            + "?download=false"
            + "&scale=8"
            ;
    }

    render() {
        return <Dialog visible={this.props.visible}>
            <header>Share</header>
            <VBox className="form">
            <HBox>
                <input className="grow" type="text" defaultValue={this.generateURL()}/>
            </HBox>
            </VBox>
            <footer className="children-right">
                <button onClick={this.props.onCanceled}>cancel</button>
            </footer>
        </Dialog>
    }
}
