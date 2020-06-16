import React, {Component, useContext} from "react";
import {PopupManagerContext} from "appy-comps"

const popupStyle = {
    margin:0,
    padding:0,
    display:'flex',
    flexDirection:'row',
    flexWrap:'wrap',
    width:32*16+'px'
};

export const ColorPicker = ({model, onSelectColor})=>{
    const pm = useContext(PopupManagerContext)
    const selectColor = (c,i,e) => {
        pm.hide();
        onSelectColor(i);
    }
    const wells = model.getPalette().map((c,i) => {
        const colorStyle ={
            border:'0px solid black',
            backgroundColor:c,
            width:32,height:32,
            display:'inline-block',
            margin:0, padding:0
        };
        return <div key={i} style={colorStyle} onClick={()=>{
            selectColor(c, i)
        }} />
    });
    return <div style={popupStyle}>{wells}</div>
}
