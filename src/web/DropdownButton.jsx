import React from "react";
import Button from "./Button.jsx";
import PopupState from "./PopupState.jsx";

export default class DropdownButton extends React.Component {

    constructor(props) {
        super(props);
        this.state = {
            open:false
        }
    }


    componentDidMount() {
        var self = this;
        this.listener = PopupState.listen(function(){
            self.setState({open:false});
        })
    }
    componentWillUnmount() {
        PopupState.unlisten(this.listener);
    }


    open() {
        this.setState({open:true})
    }
    toggle() {
        this.setState({open:!this.state.open})
    }

    close() {
        this.setState({open:false})
    }


    render() {
        var icon = "";
        if(this.props.icon) {
            icon = "fa fa-"+this.props.icon;
        }

        return <div className="dropdown-container">
            <Button tooltip="Export / Share" onClick={this.toggle.bind(this)}><i className={icon}/></Button>
            {this.renderDropdown()}
        </div>
    }

    renderDropdown() {
        if(this.state.open) {
            var direction = "down";
            if(this.props.direction) {
                direction = this.props.direction;
            }
            return <ul className={"dropdown-list " + direction}>
                {this.props.children}
            </ul>
        } else {
            return ""
        }
    }
}
