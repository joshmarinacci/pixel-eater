import React from "react";

export default class Button extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            hoverVisible:false
        }
    }
    mouseOver() {
        if(!this.props.tooltip) return;
        this.timeout = setTimeout(this.onHover.bind(this),1000);
    }
    mouseOut() {
        clearTimeout(this.timeout);
        this.setState({hoverVisible:false});
    }
    onHover() {
        this.setState({hoverVisible:true});
    }
    renderHover() {
        var hover = "";
        if(this.state.hoverVisible) {
            hover = <p className="tooltip">{this.props.tooltip}</p>
        }
        return hover;
    }
    onClick() {
        if(this.props.onClick) this.props.onClick();
    }
    generateClasses() {
        return "tooltip-button";
    }
    generateStyle() {
        return {}
    }
    render() {
        var hover = this.renderHover();
        var cls = this.generateClasses();
        let {onToggle, tooltip, spriteX, spriteY, ...rest} = this.props;
        return <button className={cls}
                       style={this.generateStyle()}
                       onMouseOver={this.mouseOver.bind(this)}
                       onMouseOut={this.mouseOut.bind(this)}
                       onClick={this.onClick.bind(this)}
            {...rest}
        >{this.props.children}{hover}</button>
    }
}

