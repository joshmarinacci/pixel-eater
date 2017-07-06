import React, {Component} from "react";
import {Dialog, VBox, HBox} from "appy-comps";
import DropdownButton from "./Dropdown.jsx";


export default class extends Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedSize: {
                w:16,
                h:16,
                toString:function() {
                    return this.w + " x " + this.h;
                }
            },
            w:16,
            h:16,
            title:'untitled doc'
        };

        this.sizes = [
            {
                w:16,
                h:16,
                toString:function() {
                    return this.w + " x " + this.h;
                }
            },
            {
                w:32,
                h:32,
                toString:function() {
                    return this.w + " x " + this.h;
                }
            }
        ]
    }

    selectPreset(preset) {
        this.setState({
            selectedSize:preset,
            w:preset.w,
            h:preset.h
        })
    }

    performOkay() {
        this.props.onOkay({
            w:parseInt(this.state.w,10),
            h:parseInt(this.state.h,10),
            title:this.state.title
        });
    }
    widthChanged() {
        this.setState({ w:this.refs.width.value })
    }
    heightChanged() {
        this.setState({ h:this.refs.height.value })
    }
    editTitle() {
        this.setState({ title: this.refs.title.value});
    }

    render() {
        return <Dialog visible={this.props.visible}>
            <header>New Doc</header>
            <VBox className="form">
                <HBox>
                    <label>Name</label>
                    <input ref='title'
                           type="text"
                           value={this.state.title}
                           onChange={this.editTitle.bind(this)}/>
                </HBox>
                <HBox>
                    <label> </label>
                    <DropdownButton list={this.sizes} onSelect={this.selectPreset.bind(this)}/>
                </HBox>
                <HBox>
                    <label>Width</label>
                    <input ref='width' className="digits5" type="number" value={this.state.w} onChange={this.widthChanged.bind(this)}/> <label className="stick-left">px</label>
                </HBox>
                <HBox>
                    <label>Height</label>
                    <input ref='height' className="digits5" type="number" value={this.state.h} onChange={this.heightChanged.bind(this)}/> <label className="stick-left">px</label>
                </HBox>
            </VBox>
            <footer className="children-right">
                <button onClick={this.performOkay.bind(this)}>okay</button>
                <button onClick={this.props.onCancel}>cancel</button>
            </footer>
        </Dialog>
    }
}