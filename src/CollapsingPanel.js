import React, {Component} from 'react'
import {HBox, VBox} from 'appy-comps'

export default class CollapsingPanel extends Component {
    constructor(props) {
        super(props)
        this.state = {
            open:false
        }
        this.toggleOpen = () => this.setState({open:!this.state.open})
    }
    render() {
        const overrideStyle = this.props.style?this.props.style:{}
        const style = Object.assign(overrideStyle,{
            flex:0
        })
        if(this.state.open) {
            if(this.props.flex) style.flex = this.props.flex
            if(this.props.width) style.width = this.props.width
            if(this.props.width) style.minWidth = this.props.width
            return <VBox style={style}>
                <HBox style={{backgroundColor:'black', color:'white'}}>
                    <button className="fa fa-chevron-down" onClick={this.toggleOpen}/>
                    {this.props.title}
                </HBox>
                {this.state.open?this.props.children:""}
            </VBox>

        } else {
            style.flex = 0
            style.minWidth = 'auto'
            style.width = 'auto'
            return <VBox style={style}>
                <button className="fa fa-chevron-right" onClick={this.toggleOpen}/>
            </VBox>
        }
    }
}

