import React from "react";
import {Component} from "react";
import Dialog from "./Dialog.jsx";

export default class NewDocPanel extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            width: props.model.getWidth(),
            height: props.model.getHeight()
        };
    }
    componentWillReceiveProps(nextProps) {
        this.handleProps(nextProps);
    }

    handleProps(props) {
        this.setState({
            width: props.model.getWidth(),
            height: props.model.getHeight()
        });
    }
    show() {
        this.setState({
            visible:true
        })
    }
    okay() {
        this.props.model.resize(this.state.width,this.state.height);
        this.setState({
            visible:false
        });
    }
    cancel() {
        this.setState({
            visible:false
        });
    }
    changedWidth() {
        var val = Number.parseInt(this.refs.width.value);
        this.setState({ width:val });
    }
    changedHeight() {
        var val = Number.parseInt(this.refs.height.value);
        this.setState({ height:val });
    }
    render() {
        return <Dialog visible={this.state.visible}>
            <header>Resize</header>

            <div className="body vbox form">
                <div className="hbox">
                    <label>Width</label>
                    <input ref='width' type="text" size="6" value={this.state.width} onChange={this.changedWidth.bind(this)}/>
                </div>
                <div className="hbox">
                    <label>Height</label>
                    <input ref="height" type="text" size="6" value={this.state.height} onChange={this.changedHeight.bind(this)}/>
                </div>
            </div>

            <footer>
                <div className="hbox right">
                    <button onClick={this.okay.bind(this)}>okay</button>
                    <button onClick={this.cancel.bind(this)}>cancel</button>
                </div>
            </footer>
        </Dialog>
    }
}
