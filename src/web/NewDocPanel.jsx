import React from "react";
import Dialog from "./Dialog.jsx";
import Config from "./Config"

class DropDown extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            popupVisible:false
        }
    }

    showDropdown() {
        this.setState({
            popupVisible:!this.state.popupVisible
        })
    }

    selectedItem(item,i) {
        this.setState({
            popupVisible:false
        });
        if(this.props.onSelect) {
            this.props.onSelect(item,i)
        }
    }

    renderList() {
        if(this.state.popupVisible) {
            var self = this;
            return <ul className="dropdown-list">
                {this.props.list.map(function(item,i) {
                    return <li key={i} onClick={self.selectedItem.bind(self,item,i)}>{item.toString()}</li>
                })}
            </ul>
        } else {
            return "";
        }

    }

    render() {
        return <div className="dropdown-container">
            <button onClick={this.showDropdown.bind(this)}>
                Presets&nbsp;<i className="fa fa-caret-down"></i>
            </button>
            {this.renderList()}
        </div>
    }
}

export default class NewDocPanel extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            selectedSize: {
                w:16,
                h:16,
                toString:function() {
                    return this.w + " x " + this.h;
                }
            }
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
        console.log('the preset is',preset);
        this.setState({
            selectedSize:preset
        })
    }

    performOkay() {
        console.log("the preset is", this.state.selectedSize);
        this.props.onOkay(this.state.selectedSize);
    }

    render() {
        return <Dialog visible={this.props.visible}>
            <header>New Doc</header>
            <div className="body" style={{height:'200px'}}>
                <div className="hbox">
                    <label>Name</label> <input type="text" value="some name"/>
                </div>
                <div className="hbox">
                </div>
                <div className="hbox">
                    <label>Width</label>
                    <input className="digits5" type="number" value={this.state.selectedSize.w}/> <label className="stick-left">px</label>
                    <label>Height</label> <input className="digits5" type="number" value={this.state.selectedSize.h}/> <label className="stick-left">px</label>
                    <DropDown list={this.sizes} onSelect={this.selectPreset.bind(this)}/>
                </div>
            </div>
            <footer>
                <div className="hbox right">
                    <button onClick={this.performOkay.bind(this)}>okay</button>
                    <button onClick={this.props.onCancel}>cancel</button>
                </div>
            </footer>
        </Dialog>
    }
}