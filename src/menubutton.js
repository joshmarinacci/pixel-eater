import React, {useState} from "react";
import {ImageButton, ImageToggleButton} from "./ImageButton.js"

export const MenuButton = ({actions, title, className, ...rest}) => {
    let [open,setOpen] = useState(false)
    if(open) {
        return <div className="dropdown-container">
            <ImageButton
                onClick={() => setOpen(false)}
                {...rest}
            >{title}</ImageButton>
            <ul className="dropdown-list">
                {actions.map(function(act,i) {
                    return <li key={i} onClick={()=>{
                        act.fun()
                        setOpen(false)
                    }}>{act.title}</li>
                })}
            </ul>
        </div>
    } else {
        return <ImageButton
            onClick={() => setOpen(true)}
            {...rest}>{title}</ImageButton>
    }

}
