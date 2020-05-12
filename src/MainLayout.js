import React, {Component} from "react";

export const MainLayout = ({showLayers, showPreview, children})=>{
    let style = {
        display:'grid',
        gridTemplateColumns: `40px 1fr ${showPreview?'[preview] 250px ':''} ${showLayers?'[layers] 250px ':''}`,
        gridTemplateRows: '2.5em 3em 1fr 32px',
    }
    return <div id="main-layout" style={style}>{children}</div>
}
