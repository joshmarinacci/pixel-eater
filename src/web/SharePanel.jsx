import React from "react";
import Dialog from "./Dialog.jsx";
import Config from "./Config"


export default class SharePanel extends React.Component {
    generateURL() {
        return Config.url("/preview/")
            + this.props.id
            + "?download=false";
    }

    render() {
        return <Dialog visible={this.props.visible}>
            <header>Share</header>
            <div className="body">
                <input type="text" value={this.generateURL()}/>
            </div>
            <footer>
                <div className="hbox right">
                    <button onClick={this.props.onCanceled}>cancel</button>
                </div>
            </footer>
        </Dialog>
    }
}
