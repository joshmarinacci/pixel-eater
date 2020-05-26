import React, {useContext, useRef} from "react";
import {PopupManagerContext} from "appy-comps"
import {ImageButton} from './ImageButton.js'

export const ColorWellButton = ({model, selectedColor, content}) => {
    const pm = useContext(PopupManagerContext)
    const button = useRef()
    const clicked = () => pm.show(content,button.current);
    return (<button ref={button} className="color-well "
                style={{
                    backgroundColor:model.lookupCanvasColor(selectedColor),
                }}
                onClick={clicked}
    ><i className="fa fa-fw"></i></button>);
}

export const PopupImageButton = ({content, src, scale, spriteX, spriteY})=>{
    const pm = useContext(PopupManagerContext)
    const button = useRef()
    const clicked = () => pm.show(content,button.current);
    return (<div ref={button} className={'wrapper'} style={{ position:'relative'}}>
        <ImageButton  src={src} scale={scale} spriteX={spriteX} spriteY={spriteY}
                      onClick={clicked}
        />
    </div>)
}
