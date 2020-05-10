import React, {Component} from "react";

export const MainLayout = ({children})=>{
    let style = {
        display:'grid',
        gridTemplateColumns: '40px 1fr 250px 250px',
        gridTemplateRows: '3em 3em 1fr 3em',
    }
    return <div id="main-layout" style={style}>{children}</div>
}
