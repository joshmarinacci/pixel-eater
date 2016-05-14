import React from "react";
import ReactDOM from "react-dom";
require('../../src/web/components.css');

/*

on drop
    update the underlying list. do a callback to say item x is removed from index A and added to index B
    figure out how to use a template
 */



class ListTest extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pressed:false,
            active:null
        };
        this.state.data = [
            'item 1',
            'item 2',
            'item 3',
            'item 4',
            'item 5'
        ];
        this.reactItems = [];
    }

    mousedown(item,i,e) {
        this._cb_handleMouseUp = this._handleMouseUp.bind(this);
        window.addEventListener('mouseup', this._cb_handleMouseUp);
        //window.addEventListener('touchend', this._handleMouseUp);
        //window.addEventListener('touchmove', this._handleTouchMove);
        this._cb_handleMouseMove = this._handleMouseMove.bind(this);
        window.addEventListener('mousemove', this._cb_handleMouseMove);
        var ref = "item"+i;
        this.setState({
            pressed:true,
            active:item,
            activeIndex:i,
            activeRef: ref,
            activeHeight: this.refs[ref].clientHeight,
            targetIndex:i
        });
    }

    findItemUnderCursor(y) {
        var found = null;
        this.reactItems.forEach((item,i)=>{
            if(item.ref == this.state.activeRef) return;
            var dom = this.refs[item.ref];
            var top = dom.getBoundingClientRect().top;
            var bottom = dom.getBoundingClientRect().bottom;
            if(y > top && y < bottom) {
                found = {item:item, index:i};
            }
        });
        return found;
    }

    _handleMouseMove(e) {
        if(!this.state.pressed) return;
        this.setState({offy: e.clientY});
        //figure out what item is under the cursor
        var found = this.findItemUnderCursor(e.clientY);
        if(found !== null && found.item.key !== 'drop-target') {
            this.setState({targetIndex:found.index})
        }
    }

    _handleMouseUp() {
        var ri = this.state.activeIndex;
        var ii = this.state.targetIndex;
        var toadd = this.state.data[ri];
        if(ii >= ri) ii=ii-1;
        this.moveItem(ri,ii,toadd);
        this.setState({pressed:false, data: this.state.data});
        window.removeEventListener('mouseup', this._cb_handleMouseUp);
        //window.removeEventListener('touchend', this._handleMouseUp);
        //window.removeEventListener('touchmove', this._handleTouchMove);
        window.removeEventListener('mousemove', this._cb_handleMouseMove);
    }

    moveItem(removeIndex, insertIndex, toInsert) {
        this.state.data.splice(removeIndex,1);
        this.state.data.splice(insertIndex,0,toInsert);
    }

    renderDropTarget() {
        return <div ref="drop-target" className="droptarget" key="drop-target"
             style={{ height: this.state.activeHeight+"px" }}
        >
            droptarget
        </div>;
    }
    renderItems(items) {
        this.reactItems = [];
        var didDrop = false;
        for(let i=0; i<items.length; i++) {
            let item = items[i];
            //insert drop target holder if needed
            if(i == this.state.targetIndex && this.state.pressed) {
                this.reactItems.push(this.renderDropTarget());
                didDrop = true;
            }

            let clss = "item";
            let style = {};

            //customizations for the active item
            if(item == this.state.active && this.state.pressed) {
                clss += " active";
                style.top = (this.state.offy-this.state.activeHeight)+"px";
            }

            //generate the item
            this.reactItems.push(<div ref={"item"+i} className={clss} key={i} style={style}>
                <button onMouseDown={this.mousedown.bind(this,item,i)}>drag handle</button> {item}</div>);
        }
        if(!didDrop && this.state.pressed) this.reactItems.push(this.renderDropTarget());
        return this.reactItems;
    }

    render() {
        return <div className="draglist">{this.renderItems(this.state.data)}</div>
    }
}


ReactDOM.render(<ListTest/>, document.getElementsByTagName("body")[0]);