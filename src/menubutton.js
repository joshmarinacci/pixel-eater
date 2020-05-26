import React, {useState, useContext, useRef} from "react";
import {ImageButton, ImageToggleButton} from "./ImageButton.js"
import {PopupManagerContext} from 'appy-comps'

export const MenuButton = ({actions, title, className, ...rest}) => {
    const pm = useContext(PopupManagerContext)
    const button = useRef()
    const open = () => {
        let content = <ul className="dropdown-list">
            {actions.map(function(act,i) {
                return <li key={i} onClick={()=>{
                    pm.hide()
                    act.fun()
                }}>{act.title}</li>
            })}
        </ul>
        pm.show(content,button.current)
    }
    return <div ref={button} className={'wrapper'} style={{ position:'relative' }}>
        <ImageButton
            onClick={open}
            {...rest}>{title}</ImageButton>
    </div>
}
