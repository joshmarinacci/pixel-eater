import React from "react";

export default class Dialog extends React.Component {
    renderChildren() {
        if(this.props.visible) return this.props.children;
        return "";
    }
    render() {
        if(!this.props.visible) return <div></div>;
        return <div className="scrim">
            <div className="dialog">
                {this.renderChildren()}
            </div>
        </div>

    }
}
