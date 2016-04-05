import React from "react";

class LayerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity:this.props.layer.opacity
        };
    }
    selectItem(e) {
        e.preventDefault();
        e.stopPropagation();
        this.props.model.setSelectedLayer(this.props.layer);
    }
    toggleVisibility() {
        var vis = this.props.model.isLayerVisible(this.props.layer);
        this.props.model.setLayerVisible(this.props.layer, !vis);
    }
    changedOpacity() {
        var opacity = this.refs.opacity.value;
        this.setState({opacity:opacity});
    }
    blurredOpacity() {
        var opacity = parseFloat(this.refs.opacity.value);
        if(opacity < 0) opacity = 0;
        if(opacity > 1.0) opacity = 1.0;
        this.props.model.setLayerOpacity(this.props.layer,opacity);
        this.setState({opacity:opacity+""});
    }
    render() {
        var cls = "hbox ";
        if(this.props.model.getCurrentLayer() == this.props.layer) cls += "selected ";
        var clsname = "fa ";
        if(this.props.model.isLayerVisible(this.props.layer)) {
            clsname += " fa-eye";
        } else {
            clsname += " fa-eye-slash"
        }
        return <li className={cls} onClick={this.selectItem.bind(this)}>
            <label className="grow" style={{ textAlign:'left'}}>{this.props.layer.title}</label>
            <input ref="opacity"
                   className="opacity"
                   type="number"
                   value={this.state.opacity}
                   onChange={this.changedOpacity.bind(this)}
                   onBlur={this.blurredOpacity.bind(this)}/>
            <button onClick={this.toggleVisibility.bind(this)}><i className={clsname}/></button>
        </li>
    }
}

export default class LayersPanel extends React.Component {
    addLayer() {
        this.props.model.appendLayer();
    }
    render() {
        var model = this.props.model;
        var layers = model.getLayers().map((l,i) => <LayerItem key={i} model={this.props.model} layer={l}/>);
        return <div className="vbox scroll">
            <ul className="grow" id="layers-panel" style={{width:'10em'}}>{layers}</ul>
            <div className="hbox">
                <button onClick={this.addLayer.bind(this)}><i className="fa fa-plus"/></button>
                <button><i className="fa fa-arrow-up"/></button>
                <button><i className="fa fa-arrow-down"/></button>
                <label></label>
                <button><i className="fa fa-trash"/></button>
            </div>
        </div>
    }
}
