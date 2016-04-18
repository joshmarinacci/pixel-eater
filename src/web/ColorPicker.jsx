import React from "react";
import PopupState from "./PopupState.jsx";

export default class ColorPicker extends React.Component {
    selectColor(c,i,e) {
        e.stopPropagation();
        PopupState.done();
        this.props.onSelectColor(i);
    }
    renderColorWell(c,i) {
        return <div key={i}
                    style={{border:'0px solid black', backgroundColor:c, width:32,height:32, display:'inline-block', margin:0, padding:0}}
                    onClick={this.selectColor.bind(this,c,i)}
        ></div>
    }
    render() {
        var wells = this.props.model.getPalette().map((c,i) => this.renderColorWell(c,i));
        return <div
            style={{
                    margin:0,
                    padding:0,
                    display:'flex',
                    flexDirection:'row',
                    flexWrap:'wrap',
                    width:32*16
            }}
        >{wells}</div>
    }
}
