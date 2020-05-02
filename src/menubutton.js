import React, {useState} from "react";
export const MenuButton = ({actions, title, className}) => {
    let [open,setOpen] = useState(false)
    if(open) {
        return <div className="dropdown-container">
            <button className={className} onClick={() => setOpen(false)}>{title}</button>
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
        return <button  className={className} onClick={() => setOpen(true)}>{title}</button>
    }

}
