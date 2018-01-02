import React from "react"
import CanvasComponent from './CanvasComponent'
import * as GraphicsUtils from './GraphicsUtils'

export default class TileView extends CanvasComponent {
    componentWillReceiveProps(props) {
        setTimeout(() => this.draw(),100)
    }
    mousedown = (pt,e) => {
        if(this.props.onClick) this.props.onClick(this.props.sprite)
    }
    render() {
        const IS = this.props.store
        const overrideStyle = this.props.style?this.props.style:{}
        const style = Object.assign(overrideStyle,{})
        return <canvas
            style={style}
            ref={(can)=>this.canvas = can}
            width={this.scale*IS.getTileWidth(this.props.sprite)}
            height={this.scale*IS.getTileHeight(this.props.sprite)}
            onMouseDown={(e) => this.mousedown(this.toCanvas(e),e)}
            onMouseMove={this.mousemove}
            onMouseUp={this.mouseup}
        />
    }

    draw() {
        if(!this.canvas) return
        const c = this.canvas.getContext('2d')
        GraphicsUtils.drawSprite(this.props.store, this.props.palette , c, this.props.sprite, this.scale)
    }
    getWidth() {
        return this.props.store.getTileWidth(this.props.model)
    }
    getHeight() {
        return this.props.store.getTileHeight(this.props.model)
    }
}


