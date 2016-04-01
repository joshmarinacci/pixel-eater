import React from "react";

export default class Dialog extends React.Component {
    renderChildren() {
        if(this.props.visible) return this.props.children;
        return "";
    }
    render() {
        if(!this.props.visible) return <div></div>;
        return <div className="dialog narrow" style={{visibility:this.props.visible?'visible':'hidden'}}>
            <div className="scrim"></div>
            <div className="content">
                {this.renderChildren()}
            </div>
        </div>

    }
}
