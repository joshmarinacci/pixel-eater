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
        pt = pt.div(16).div(this.scale)
        this.props.store.setTileInScene(this.props.sheet,this.props.tile, Math.floor(pt.x), Math.floor(pt.y))
    }

    draw() {
        if(!this.canvas) return
        const c = this.canvas.getContext('2d')
        const scene = this.props.scene;
        scene.get('layers').forEach((layer)=>{
            if(!layer.get('visible')) return
            layer.get('tiles').forEach((tileRef)=>{
                const tileId = tileRef.get('tileId')
                const sheetId = tileRef.get('sheetId')
                const doc = this.props.store.getDoc()
                const sheet = doc.get('sheets').find((sheet)=>sheet.get('id')===sheetId)
                const palette = sheet.get('palette')
                const tile = sheet.get('tiles').find((tile)=>tile.get('id')===tileId)
                c.save();
                const tx = tileRef.get('x')*this.scale*16
                const ty = tileRef.get('y')*this.scale*16
                c.translate(tx,ty)
                drawSprite(this.props.store,palette,c,tile,this.scale)
                c.strokeStyle = 'black'
                c.strokeRect(0,0,this.scale*16,this.scale*16)
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