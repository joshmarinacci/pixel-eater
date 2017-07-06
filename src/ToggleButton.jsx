import Button from "./Button.jsx"

export default class ToggleButton extends Button {
    onClick() {
        if(this.props.onToggle) {
            this.props.onToggle();
        } else {
            super.onClick();
        }
    }
    generateStyle() {
        let cls = super.generateStyle();
        if(this.props.selected === true)  cls += " selected";
        return cls;
    }
}

