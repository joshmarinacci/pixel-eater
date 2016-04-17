import React from "react";

export default class RecentColors extends React.Component {

    selectedColor(color) {
        this.props.onSelectColor(color);
    }
    render() {
        var boxes = this.props.colors.map((color,i)=>{
            var cc = this.props.model.lookupCanvasColor(color);
            return <div
                className="swatch"
                style={{backgroundColor:cc}}
                key={i}
                onClick={this.selectedColor.bind(this,color)}></div>
        });
        return <div className="hbox">{boxes}</div>
    }
}