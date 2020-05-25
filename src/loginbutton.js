import React, {Component, useState, useEffect} from "react";
import {LOGIN} from 'docserver2-client'

export const LoginButton = ({docserver})=> {
    const ds = docserver
    const [li, setLi] = useState(ds.isLoggedIn())
    useEffect(()=>{
        let cb = () => {
            console.log('login changed')
            setLi(ds.isLoggedIn())
        }
        ds.on(LOGIN,cb)
        return () => {
            ds.off(LOGIN,cb)
        }
    },li)
    if(ds.isLoggedIn()) {
        return <button onClick={()=>ds.startLogout()}>{ds.getUsername()}</button>
    }
    return <button onClick={()=>{
        ds.startLogin()
    }}>login</button>
}
