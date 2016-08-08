import React from 'react'
import PopupState from "../PopupState.jsx"

export default class PopupContainer extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            open:false
        }
    }
    componentDidMount() {
        this.listener = PopupState.listen((src)=>{
            if(src !== this) this.setState({open:false});
        })
    }
    componentWillUnmount() {
        PopupButton.unlisten(this.listener);
    }
    open() {
        this.setState({open:true});
        PopupState.open(this);
    }
    render() {
        return <div style={{
                    position: 'absolute',
                    left:'120%',
                    top:0,
                    border: "1px solid red",
                    backgroundColor:'white',
                    display:this.state.open?'block':'none'
                    }}
        >{this.props.children}
        </div>
    }
}


