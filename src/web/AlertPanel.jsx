import React from "react";
import Dialog from "./Dialog.jsx";

export default class AlertPanel extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            text:'nothing',
            cancelText:'cancel',
            okayText:'okay',
            onCancel:null,
            onOkay:null
        }
    }

    show(opts) {
        this.setState({visible:true});
        this.setState(opts);
    }
    hide() {
        this.setState({visible:false});
    }

    render() {
        return <Dialog visible={this.state.visible}>
            <header>Alert</header>
            <div className="grow">
                {this.state.text}
            </div>
            <footer className="children-right">
                <button
                    onClick={this.state.onCancel}
                    >{this.state.cancelText}</button>
                <button
                    onClick={this.state.onOkay}
                    className="primary">{this.state.okayText}</button>
            </footer>
        </Dialog>
    }
}
