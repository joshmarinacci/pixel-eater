import React from "react";
import DropdownButton from "./DropdownButton.jsx"
import ColorPicker from "./ColorPicker.jsx"
import PopupState from "./PopupState.jsx";
import DraggableList from "./DraggableList.jsx";

class LayerItem extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            opacity:Math.floor(this.props.layer.opacity*100),
            editingName:false,
            invalid:false
        };
    }
    componentWillReceiveProps(props) {
        this.setState({
            opacity:Math.floor(this.props.layer.opacity*100)
        });
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
        this.setBack(opacity);
        this.setState({opacity:opacity+""});
    }
    blurredOpacity() {
        this.setBack(this.refs.opacity.value);
    }
    setBack(sop) {
        var opacity = parseFloat(sop);
        if(Number.isNaN(opacity)) {
            this.setState({invalid:true});
            return;
        }
        if(opacity < 0) opacity = 0;
        if(opacity > 100) opacity = 10;
        this.props.model.setLayerOpacity(this.props.layer,opacity/100.0);
        this.setState({opacity:opacity+""});
        this.setState({invalid:false});
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
        var cls = "layer hbox ";
        if(this.props.model.getCurrentLayer() == this.props.layer) cls += "selected ";
        var clsname = "fa ";
        if(this.props.model.isLayerVisible(this.props.layer)) {
            clsname += " fa-eye";
        } else {
            clsname += " fa-eye-slash"
        }
        return <div className={cls} onClick={this.selectItem.bind(this)}>
            <button><i className="fa fa-bars" onMouseDown={this.props.onMouseDown}/></button>
            {this.renderName(this.state.editingName)}
            <input ref="opacity"
                   className="opacity"
                   type="number"
                   min="0"
                   max="100"
                   value={this.state.opacity}
                   className={this.state.invalid?"invalid":""}
                   onChange={this.changedOpacity.bind(this)}
                   onBlur={this.blurredOpacity.bind(this)}/>
            <button onClick={this.toggleVisibility.bind(this)}><i className={clsname}/></button>
        </div>
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
    itemDropped(remove,insert,item) {
        this.props.model.moveLayerTo(item,insert);
        this.props.model.setSelectedLayer(item);
        console.log("layers now ", this.props.model.layers.map((l)=> l.title+' '+l.opacity).join(","));
    }
    makeLayerItem(l,i,cb) {
        return <LayerItem model={this.props.model} layer={l} onMouseDown={cb}/>
    }
    render() {
        var model = this.props.model;
        return <div className="vbox">
            <DraggableList className="grow" id='layers-panel' style={{width:'10em'}}
                           data={model.getLayers()}
                           templateFunction={this.makeLayerItem.bind(this)}
                           onDropItem={this.itemDropped.bind(this)}
            />
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
