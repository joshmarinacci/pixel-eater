import React, {Component} from "react";
import {PopupManager} from "appy-comps";

const popupStyle = {
    margin:0,
    padding:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'wrap',
    width:32*16+'px'
};

export default class extends Component {
    selectColor(c,i,e) {
        PopupManager.hide();
        this.props.onSelectColor(i);
    }
    render() {
        return <div style={popupStyle}>{this.props.palette.get('colors').map((c,i) => {
             const colorStyle ={border:'0px solid black', backgroundColor:c, width:32,height:32, display:'inline-block', margin:0, padding:0};
            return <div key={i} style={colorStyle} onClick={this.selectColor.bind(this, c, i)} />
        })}</div>
    }
}
