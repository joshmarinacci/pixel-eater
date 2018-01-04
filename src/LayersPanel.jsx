import React, {Component} from "react";
import {VBox, HBox, Spacer} from "appy-comps";
import SimpleList from './SimpleList'

const LayerItemRenderer = (props) => {
    const visible_class = "fa " + (props.item.get('visible')?"fa-eye":"fa-eye-slash")
    const name = props.item.get('title')
    const style = {}
    if(props.selected) {
        style.backgroundColor ='#ccddff'
    }
    return <HBox className="layer" style={style} onClick={()=>props.layerSelected(props.item, props.index)}>
        {name}
        <Spacer/>
        <button className={visible_class} onClick={(e)=>{
            e.stopPropagation()
            props.toggleVisible(props.item)}}/>
    </HBox>
}

class LayerItem extends Component {
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
        let vis = this.props.model.isLayerVisible(this.props.layer);
        this.props.model.setLayerVisible(this.props.layer, !vis);
    }
    changedOpacity() {
        let opacity = this.refs.opacity.value;
        this.setBack(opacity);
        this.setState({opacity:opacity+""});
    }
    blurredOpacity() {
        this.setBack(this.refs.opacity.value);
    }
    setBack(sop) {
        let opacity = parseFloat(sop);
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
        if(e.key === 'Enter') {
            this.saveEditedName();
        }
    }
    renderName(editing) {
        if(editing) {
            return <HBox>
                <input ref="title" type="text" defaultValue={this.props.layer.title} onKeyUp={this.keyUp.bind(this)} />
                <button onClick={this.saveEditedName.bind(this)}>set</button>
            </HBox>;
        } else {
            return <label className="grow" style={{ textAlign:'left'}}
                   onDoubleClick={this.doubleClick.bind(this)}>{this.props.layer.title}</label>;
        }
    }
    render() {
        let cls = "layer hbox ";
        if(this.props.model.getCurrentLayer() === this.props.layer) cls += "selected ";
        let clsname = "fa ";
        if(this.props.model.isLayerVisible(this.props.layer)) {
            clsname += " fa-eye";
        } else {
            clsname += " fa-eye-slash"
        }
        return <HBox className={cls} onClick={this.selectItem.bind(this)}>
            <button><i className="fa fa-bars" onMouseDown={this.props.onMouseDown}/></button>
            {this.renderName(this.state.editingName)}
            <input ref="opacity"
                   type="number"
                   min="0"
                   max="100"
                   value={this.state.opacity}
                   className={this.state.invalid?"invalid":""}
                   onChange={this.changedOpacity.bind(this)}
                   onBlur={this.blurredOpacity.bind(this)}/>
            <button onClick={this.toggleVisibility.bind(this)}><i className={clsname}/></button>
        </HBox>
    }
}

export default class LayersPanel extends Component {
    addLayer = () => this.props.store.addLayerToTile(this.props.sheet,this.props.model)
    toggleVisible = (layer) => this.props.store.toggleLayerVisibility(this.props.sheet,this.props.model,layer)
    render() {
        const layers = this.props.store.getLayers(this.props.model)
        return <VBox grow>
            <SimpleList
                list={layers}
                style={{border:'1px solid blue'}}
                orientation={'vertical'}
                renderer={LayerItemRenderer}
                selectedItem={this.props.selectedLayer}
                layerSelected={this.props.onLayerSelected}
                toggleVisible={this.toggleVisible}
            />
            <HBox className="panel bottom">
                <button onClick={this.addLayer}><i className="fa fa-plus"/></button>
                <button onClick={this.moveLayerUp}><i className="fa fa-arrow-up"/></button>
                <button onClick={this.moveLayerDown}><i className="fa fa-arrow-down"/></button>
                <Spacer/>
                <button onClick={this.deleteLayer}><i className="fa fa-trash"/></button>
            </HBox>
        </VBox>
    }
}
