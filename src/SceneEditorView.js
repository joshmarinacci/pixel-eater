import React, {Component} from 'react'
import CanvasComponent from './CanvasComponent'
import {drawSprite} from './GraphicsUtils'

export default class SceneEditorView extends CanvasComponent {
    constructor(props) {
        super(props)
        this.scale = 4
    }
    componentWillReceiveProps(props) {
        setTimeout(() => this.draw(),100)
    }
    mousedown = (pt,e) => {
        pt = pt.div(16).div(this.scale).floor()
        if(this.props.tool.name === 'draw') {
            this.props.store.setTileInScene(this.props.scene, this.props.tile, pt)
        } else {
            this.props.store.removeTileInScene(this.props.scene, pt)
        }
    }

    draw() {
        if(!this.canvas) return
        const c = this.canvas.getContext('2d')
        const scene = this.props.scene;
        c.fillStyle = 'white'
        c.fillRect(0,0,this.canvas.width,this.canvas.height)
        const store = this.props.store;
        store.getSceneLayers(scene).forEach(layer => {
            if(!layer.get('visible')) return
            store.forEachTileInSceneLayer(scene,layer,(tile,palette,tx,ty) => {
                c.save()
                c.translate(tx*this.scale*16,ty*this.scale*16)
                drawSprite(store,palette,c,tile,this.scale)
                if(this.props.showGrid) {
                    c.strokeStyle = 'black'
                    c.strokeRect(0, 0, this.scale * 16, this.scale * 16)
                }
                c.restore()
            })
        })
    }

    render() {
        const overrideStyle = this.props.style?this.props.style:{}
        const style = Object.assign(overrideStyle,{})
        const IS = this.props.store
        return <canvas
            style={style}
            ref={(can)=>this.canvas = can}
            width={this.scale*IS.getSceneWidth(this.props.scene)*16}
            height={this.scale*IS.getSceneHeight(this.props.scene)*16}
            onMouseDown={(e) => this.mousedown(this.toCanvas(e),e)}
            onMouseMove={this.mousemove}
            onMouseUp={this.mouseup}
        />
    }
}