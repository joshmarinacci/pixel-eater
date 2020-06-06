import React, {useEffect, useRef} from 'react'

export const StampView = ({ pattern, model})=>{
    let can = useRef()
    useEffect(()=>{
        if(can.current) {
            let ctx = can.current.getContext('2d')
            ctx.fillStyle = 'black'
            ctx.fillRect(0,0,can.current.width,can.current.height)
            ctx.imageSmoothingEnabled = false
            if(pattern) {
                let sc = can.current.width/pattern.width()
                for(let x=0; x<pattern.width(); x++) {
                    for (let y = 0; y < pattern.height(); y++) {
                        let val = pattern.get_xy(x, y)
                        if(val === -1) continue
                        ctx.fillStyle = model.lookupCanvasColor(val);
                        ctx.fillRect(x * sc, y * sc, sc, sc);
                    }
                }
            }
        }
    })
    return <div><canvas ref={can} width={32} height={32} style={{border:'1px solid black'}}/></div>
}
