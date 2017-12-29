import React, {Component} from "react";
import {VBox, HBox, Spacer} from "appy-comps";

const SimpleListRenderer = (props) => {
    return <div>an item is here {props.item.toString()}</div>
}

export default class SimpleList extends Component {
    render() {
        let { renderer, orientation, list, ...rest} = this.props
        let Renderer = SimpleListRenderer
        if(renderer) Renderer = renderer
        let style = {
            display:'flex',
        }
        if(orientation) {
            if(orientation === 'wrap') {
                style.flexDirection = 'row'
                style.flexWrap = 'wrap'
            }
            if(orientation === 'vertical') {
                style.flexDirection = 'column'
            }
        }
        if(this.props.style) {
            style = Object.assign(this.props.style,style)
        }
        return <div style={style}>
            {list.map((item, i)=>{
                return <Renderer item={item} key={i} index={i} selected={item===this.props.selectedItem} {...rest}/>
            })}
        </div>
    }
}
