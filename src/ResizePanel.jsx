import React, {Component} from "react";
import {Dialog, VBox, HBox} from "appy-comps";

export default class extends Component {
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
        let val = Number.parseInt(this.refs.width.value,10);
        this.setState({ width:val });
    }
    changedHeight() {
        let val = Number.parseInt(this.refs.height.value,10);
        this.setState({ height:val });
    }
    render() {
        return <Dialog visible={this.state.visible}>
            <header>Resize Canvas Dimensions</header>

            <VBox className="form">
                <HBox>
                    <label>Width</label>
                    <input ref='width' type="text" size="6" value={this.state.width} onChange={this.changedWidth.bind(this)}/>
                </HBox>
                <HBox>
                    <label>Height</label>
                    <input ref="height" type="text" size="6" value={this.state.height} onChange={this.changedHeight.bind(this)}/>
                </HBox>
            </VBox>

            <footer className="children-right">
                <button onClick={this.okay.bind(this)}>okay</button>
                <button onClick={this.cancel.bind(this)}>cancel</button>
            </footer>
        </Dialog>
    }
}
