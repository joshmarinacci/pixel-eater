import React from "react";
import ReactDOM from "react-dom";

export default class DraggableList extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            pressed:false,
            active:null
        };
        this.reactItems = [];
    }

    mousedown(item,i,e) {
        e.preventDefault();
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
            targetIndex:i,
            offy: e.clientY
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
        var toadd = this.props.data[ri];
        if(ii >= ri) ii=ii-1;
        this.props.onDropItem(ri,ii,toadd);
        this.setState({pressed:false});
        window.removeEventListener('mouseup', this._cb_handleMouseUp);
        //window.removeEventListener('touchend', this._handleMouseUp);
        //window.removeEventListener('touchmove', this._handleTouchMove);
        window.removeEventListener('mousemove', this._cb_handleMouseMove);
    }

    renderDropTarget() {
        return <li ref="drop-target" className="droptarget" key="drop-target"
                    style={{ height: this.state.activeHeight+"px" }}
        >  </li>;
    }
    renderItem(item,index,mouseCallback) {
        if(this.props.itemTemplate) {
            return React.createElement(this.props.itemTemplate,{
                item:item,
                startDrag:mouseCallback
            });
        }
        if(this.props.templateFunction) {
            return this.props.templateFunction(item,index,mouseCallback)
        }
        return <div className="item"><button onMouseDown={mouseCallback}>=</button>{item.toString()}</div>
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

            let clss = "item-container";
            let style = {};

            //customizations for the active item
            if(item == this.state.active && this.state.pressed) {
                clss += " active";
                style.top = (this.state.offy-this.state.activeHeight)+"px";
            }

            var ch = this.renderItem(item,i,this.mousedown.bind(this,item,i));
            //generate the item
            this.reactItems.push(<li className={clss}  style={style} ref={"item"+i} key={i}>{ch}</li>);
        }
        if(!didDrop && this.state.pressed) this.reactItems.push(this.renderDropTarget());
        return this.reactItems;
    }

    render() {
        var clss = 'draglist ' + (this.props.className?this.props.className:"");
        return <ul  {...this.props} className={clss}>{this.renderItems(this.props.data)}</ul>
    }
}

