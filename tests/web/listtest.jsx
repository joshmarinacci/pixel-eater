import React from "react";
import ReactDOM from "react-dom";
require('../../src/web/components.css');
import DraggableList from '../../src/web/components/DraggableList.jsx'
/*

on drop
    //update the underlying list. do a callback to say item x is removed from index A and added to index B
    //figure out how to use a template
 */

class ListItem extends React.Component {
    render() {
        return <div>
            <button onMouseDown={this.props.startDrag}>d</button>
            {this.props.item.title} = {this.props.item.value}
        </div>
    }
}

class ListTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            data: [
                { title: "foo1", value:4},
                { title: "foo2", value:8},
                {title: "foo3", value:3},
                {title: "foo4", value:77}
            ]
        }
    }
    itemDropped(removeIndex, insertIndex, toInsert) {
        this.state.data.splice(removeIndex,1);
        this.state.data.splice(insertIndex,0,toInsert);
    }
    render() {
        return <DraggableList
            data={this.state.data}
            onDropItem={this.itemDropped.bind(this)}

        ></DraggableList>
    }
}


ReactDOM.render(<ListTest/>, document.getElementsByTagName("body")[0]);