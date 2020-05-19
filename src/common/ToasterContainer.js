import React, {Component} from 'react'

class ToasterManagerImpl {
    constructor() {
        this.adds = []
    }
    add(note) {
        this.adds.forEach(cb => cb(note))
    }
    onAdd(cb) {
        this.adds.push(cb);
    }
    offAdd(cb) {
        this.adds = this.adds.filter(n => n !== cb)
    }
}

export const ToasterManager = new ToasterManagerImpl()

export class ToasterContainer extends Component {
    constructor(props) {
        super(props)
        this.state = {
            notification:'saved',
            visible:false
        }
    }

    add = (payload) => {
        this.setState({notification:payload, visible:true})
        setTimeout(this.hide,2000)
    }

    hide = () => this.setState({visible:false})

    componentWillMount() {
        ToasterManager.onAdd(this.add)
    }
    componentWillUnmount() {
        ToasterManager.offAdd(this.add)
    }

    render() {
        return <div style={{
            position:'absolute',
            bottom:'10px',
            left:'10px',
            backgroundColor:'rgba(0,0,0,0.6)',
            borderRadius:'1em',
            color:'white',
            fontSize:'16pt',
            padding:'1em',
            display:this.state.visible?'block':'none'
        }}>{this.state.notification}</div>
    }
}
