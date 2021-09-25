import React, {Component} from "react"
import {HBox, StandardDialog, Spacer} from "appy-comps"

const SimplePopupList = ({list,value,onSelect}) => {
    let onChange = (e) => onSelect(list.find(v => v.id === e.target.value))
    return <select onChange={onChange} value={value.id}>
        {list.map((item, i)=> <option key={i} value={item.id}>{item.toString()}</option>)}
    </select>
}

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
            selectedPalette: 'nes',
            w:16,
            h:16,
            title:'untitled doc'
        };

        this.sizes = [
            {
                id:'16x16',
                w:16,
                h:16,
                toString:function() {
                    return this.w + " x " + this.h;
                }
            },
            {
                id:'32x32',
                w:32,
                h:32,
                toString:function() {
                    return this.w + " x " + this.h;
                }
            }
        ]

        this.palettes = [
            {
                id: 'nes',
                title:'NES 8bit',
                toString: function() {
                    return this.title
                }
            },
            {
                id:'pico8',
                title: 'Pico 8',
                toString: function() {
                    return this.title
                }
            },
            {
                id:'makecode_arcade',
                title: 'Makecode Arcade',
                toString: function() {
                    return this.title
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

    selectPalette(palette) {
        console.log("setting the palette to",palette)
        this.setState({
            selectedPalette:palette.id,
        })
    }

    performOkay() {
        this.props.onOkay({
            w:parseInt(this.state.w,10),
            h:parseInt(this.state.h,10),
            title:this.state.title,
            palette:this.state.selectedPalette,
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
        return <StandardDialog visible={true}>
            <header>New Doc</header>
            <main className="form">
                <HBox>
                    <label>Name</label>
                    <input ref='title'
                           type="text"
                           value={this.state.title}
                           onChange={this.editTitle.bind(this)}/>
                </HBox>
                <HBox>
                    <label> </label>
                    <SimplePopupList list={this.sizes} value={this.state.selectedSize} onSelect={this.selectPreset.bind(this)}/>
                </HBox>
                <HBox>
                    <label>Width</label>
                    <input ref='width' className="digits5" type="number" value={this.state.w} onChange={this.widthChanged.bind(this)}/> <label className="stick-left">px</label>
                </HBox>
                <HBox>
                    <label>Height</label>
                    <input ref='height' className="digits5" type="number" value={this.state.h} onChange={this.heightChanged.bind(this)}/> <label className="stick-left">px</label>
                </HBox>
                <HBox>
                    <label> </label>
                    <SimplePopupList list={this.palettes} value={this.state.selectedPalette} onSelect={this.selectPalette.bind(this)}/>
                </HBox>
            </main>
            <footer className="children-right">
                <Spacer/>
                <button onClick={this.props.onCancel}>cancel</button>
                <button onClick={this.performOkay.bind(this)}>okay</button>
            </footer>
        </StandardDialog>
    }
}
