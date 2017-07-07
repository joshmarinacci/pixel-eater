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

        this.show = () => this.setState({visible:true});
        this.cancel = () => this.setState({visible:false});
        this.changedWidth = () =>  this.setState({ width:Number.parseInt(this.refs.width.value,10) });
        this.changedHeight = () => this.setState({ height:Number.parseInt(this.refs.height.value,10) });
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
    okay() {
        this.props.model.resize(this.state.width,this.state.height);
        this.setState({ visible:false });
    }
    render() {
        return <Dialog visible={this.state.visible}>
            <header>Resize Canvas Dimensions</header>
            <VBox className="form">
                <HBox>
                    <label>Width</label>
                    <input ref='width' type="text" size="6" value={this.state.width} onChange={this.changedWidth}/>
                </HBox>
                <HBox>
                    <label>Height</label>
                    <input ref="height" type="text" size="6" value={this.state.height} onChange={this.changedHeight}/>
                </HBox>
            </VBox>

            <footer className="children-right">
                <button onClick={this.okay}>okay</button>
                <button onClick={this.cancel}>cancel</button>
            </footer>
        </Dialog>
    }
}
