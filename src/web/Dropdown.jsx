import React from "react";

export default class DropdownButton extends React.Component {

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
