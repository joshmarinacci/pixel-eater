import React, {Component} from 'react'
import P from "./P"

export default class CanvasComponent extends Component {
    constructor(props) {
        super(props)
        this.scale = 8
        if(props.scale) this.scale = props.scale
    }
    componentDidMount() {
        this.draw();
    }
    setState(state) {
        super.setState(state)
        setTimeout(() => this.draw(),100)
    }
    toCanvas(e) {
        const rect = this.canvas.getBoundingClientRect()
        return new P(e.clientX,e.clientY).sub(new P(rect.left,rect.top))
    }
    render() {
        return <div><canvas
            ref={(can)=>this.canvas = can}
            width={400} height={400}
            onMouseDown={(e) => this.mousedown(this.toCanvas(e),e)}
            onMouseMove={this.mousemove}
            onMouseUp={this.mouseup}
        /></div>
    }
}
