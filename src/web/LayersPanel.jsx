import React from "react";
import DropdownButton from "./DropdownButton.jsx"
import ColorPicker from "./ColorPicker.jsx"
import PopupState from "./PopupState.jsx";

class LayerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity:this.props.layer.opacity,
            editingName:false
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
    doubleClick(e) {
        e.stopPropagation();
        e.preventDefault();
        this.setState({editingName:true})
    }
    saveEditedName() {
        this.props.model.setLayerTitle(this.props.layer,this.refs.title.value);
        this.setState({editingName:false})
    }
    keyUp(e) {
        if(e.key == 'Enter') {
            this.saveEditedName();
        }
    }
    renderName(editing) {
        if(editing) {
            return <div className="hbox">
                <input ref="title" type="text" defaultValue={this.props.layer.title} onKeyUp={this.keyUp.bind(this)} />
                <button onClick={this.saveEditedName.bind(this)}>set</button>
            </div>;
        } else {
            return <label className="grow" style={{ textAlign:'left'}}
                   onDoubleClick={this.doubleClick.bind(this)}>{this.props.layer.title}</label>;
        }
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
            {this.renderName(this.state.editingName)}
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
        var layer = this.props.model.appendLayer();
        this.props.model.setSelectedLayer(layer);
    }
    deleteLayer() {
        var sel = this.props.model.getCurrentLayer();
        this.props.model.deleteLayer(sel)
    }
    moveLayerUp() {
        var cur = this.props.model.getCurrentLayer();
        var n = this.props.model.getLayerIndex(cur);
        if(n > 0) this.props.model.moveLayerTo(cur,n-1);
        this.props.model.setSelectedLayer(cur);
    }
    moveLayerDown() {
        var cur = this.props.model.getCurrentLayer();
        var n = this.props.model.getLayerIndex(cur);
        if(n+1 < this.props.model.layers.length) this.props.model.moveLayerTo(cur,n+1);
        this.props.model.setSelectedLayer(cur);
    }
    selectBGColor(color) {
        PopupState.done();
        this.props.model.setBackgroundColor(color);
    }
    render() {
        var model = this.props.model;
        var layers = model.getLayers().map((l,i) => <LayerItem key={i} model={this.props.model} layer={l}/>);
        return <div className="vbox">
            <ul className="grow" id="layers-panel" style={{width:'10em'}}>{layers}</ul>
            <div className="hbox">
                <button onClick={this.addLayer.bind(this)}><i className="fa fa-plus"/></button>
                <button onClick={this.moveLayerUp.bind(this)}><i className="fa fa-arrow-up"/></button>
                <button onClick={this.moveLayerDown.bind(this)}><i className="fa fa-arrow-down"/></button>
                <label></label>
                <button onClick={this.deleteLayer.bind(this)}><i className="fa fa-trash"/></button>
                <label></label>
                <DropdownButton icon="picture-o" direction="upper-left" tooltip="Background color">
                    <ColorPicker model={model} onSelectColor={this.selectBGColor.bind(this)}/>
                </DropdownButton>
            </div>
        </div>
    }
}
