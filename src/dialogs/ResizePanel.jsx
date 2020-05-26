import React, {Component} from "react";
import {Dialog, VBox, HBox, DialogManager, StandardDialog, Spacer} from "appy-comps"


export default class extends Component {
    constructor(props) {
        super(props);
        this.state = {
            visible: false,
            width: props.model.getWidth(),
            height: props.model.getHeight()
        };

        this.show = () => this.setState({visible:true});
        this.cancel = () => DialogManager.hide();
        this.changedWidth = () =>  this.setState({ width:Number.parseInt(this.refs.width.value,10) });
        this.changedHeight = () => this.setState({ height:Number.parseInt(this.refs.height.value,10) });
        this.okay = () => {
            this.props.model.resize(this.state.width,this.state.height);
            // this.setState({ visible:false });
            DialogManager.hide();
        }
    }
    componentWillReceiveProps(nextProps) {
        this.setState({
            width: nextProps.model.getWidth(),
            height: nextProps.model.getHeight()
        });
    }

    render() {
        return <StandardDialog visible={true}>
            <header>Resize Canvas Dimensions</header>
            <main className="form">
                <HBox>
                    <label>Width</label>
                    <input ref='width' type="text" size="6" value={this.state.width} onChange={this.changedWidth}/>
                </HBox>
                <HBox>
                    <label>Height</label>
                    <input ref="height" type="text" size="6" value={this.state.height} onChange={this.changedHeight}/>
                </HBox>
            </main>

            <footer className="children-right">
                <Spacer/>
                <button onClick={this.okay}>okay</button>
                <button onClick={this.cancel}>cancel</button>
            </footer>
        </StandardDialog>
    }
}
