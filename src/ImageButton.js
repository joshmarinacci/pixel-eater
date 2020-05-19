import React from "react";
import Button from "./common/Button.jsx"
import ToggleButton from "./common/ToggleButton.jsx"
export class ImageButton extends Button {
    generateClasses() {
        return super.generateClasses() + " image-button"
    }
    generateStyle() {
        let style = {
            backgroundImage:`url(${this.props.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `-${this.props.spriteX*16*this.props.scale}px -${this.props.spriteY*16*this.props.scale}px`,
            backgroundSize: `${200*window.devicePixelRatio*this.props.scale}%`,
            width:16*this.props.scale,
            height:16*this.props.scale,
            borderWidth: '0px',
            borderRadius: 0,
            borderColor: 'black',
            padding:0,
            margin:0,
            imageRendering:'crispEdges',
        }
        return style
    }
}
export class ImageToggleButton extends ToggleButton {
    generateClasses() {
        return super.generateClasses() + " image-button"
    }

    generateStyle() {
        let style = {
            backgroundImage:`url(${this.props.src})`,
            backgroundRepeat: 'no-repeat',
            backgroundPosition: `-${this.props.spriteX*16*this.props.scale}px -${this.props.spriteY*16*this.props.scale}px`,
            backgroundSize: `${200*window.devicePixelRatio*this.props.scale}%`,
            width:16*this.props.scale,
            height:16*this.props.scale,
            borderWidth: '0px',
            borderRadius: 0,
            borderColor: 'black',
            padding:0,
            margin:0,
            imageRendering:'crispEdges',
        }
        return style
    }
}
