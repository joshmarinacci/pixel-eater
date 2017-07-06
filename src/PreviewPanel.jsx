import React, {Component} from "react";

export default class PreviewPanel extends Component {
    componentDidMount() {
        this.drawCanvas();
    }
    componentWillReceiveProps(props) {
        setTimeout(this.drawCanvas.bind(this),0);
    }
    shouldComponentUpdate() {
        return false;
    }
    drawCanvas() {
        let c = this.refs.canvas.getContext('2d');
        let w = this.props.model.getWidth();
        c.fillStyle = 'white';
        c.fillRect(0,0,this.refs.canvas.width,this.refs.canvas.height);
        this.drawScaled(c,0,w*0,w,1);
        this.drawScaled(c,0,w*1,w,2);
        this.drawScaled(c,0,w*3,w,4);
        this.drawScaled(c,0,w*7,w,8);
        this.drawScaled(c,0,w*15,w,16);
    }
    drawScaled(c,ox,oy,w,s) {
        c.save();
        c.translate(ox,oy);
        c.fillStyle = this.props.model.lookupCanvasColor(this.props.model.getBackgroundColor());
        c.fillRect(0,0,w*s,w*s);
        c.strokeStyle = 'black';
        c.strokeRect(0.5,0.5,w*s,w*s);
        this.props.model.getReverseLayers().map((layer) => this.drawLayer(c, layer,s, this.props.model));
        c.restore();
    }
    drawLayer(c,layer,sc, model) {
        if(!layer.visible) return;
        c.save();
        c.globalAlpha = layer.opacity;
        let w = model.getWidth();
        let h = model.getHeight();
        for(let y=0; y<h; y++) {
            for (let x = 0; x < w; x++) {
                let val = this.props.model.getPixelFromLayer(x, y, layer);
                if(val === -1) continue;
                c.fillStyle = this.props.model.lookupCanvasColor(val);
                c.fillRect(x * sc, y * sc, sc, sc);
            }
        }
        c.restore();
    }
    render() {
        return <div className="grow scroll">
            <canvas ref="canvas" width={16*16+1} height={16*31+1}/>
        </div>
    }
}
