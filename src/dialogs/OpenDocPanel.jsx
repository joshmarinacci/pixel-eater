import React, {Component} from "react";
import {StandardDialog, Spacer} from "appy-comps"
import {MAX_THUMB_DIM} from '../DocStore.js'

function findBestThumbnail(thumbnails) {
    if(thumbnails.length === 0) return null
    if(thumbnails.length === 1) return thumbnails[0]
    let list = thumbnails.slice().sort((a,b)=>b.width - a.width)
    return list.find(t => t.width <= MAX_THUMB_DIM)
}

export default class OpenDocPanel extends Component {
    loadDoc(id) {
        this.props.onSelectDoc(id);
    }
    deleteDoc(id) {
        this.props.onDeleteDoc(id);
    }
    renderDocs(docs) {
        return <ul className={'doc-list'}>{docs.map((doc)=> {
            return <li key={doc._id}>
                <button onClick={this.loadDoc.bind(this,doc._id)}>{doc.title}</button>
                <button onClick={this.deleteDoc.bind(this,doc._id)}>delete</button>
                <button onClick={this.loadDoc.bind(this,doc._id)}>{this.renderThumbnail(doc)}</button>
            </li>
        })}</ul>;
    }
    render() {
        return <StandardDialog visible={true}>
            <header>Open</header>
            <main>
                {this.renderDocs(this.props.docs)}
            </main>
            <footer className="children-right">
                <Spacer/>
                <button onClick={this.props.onCanceled}>cancel</button>
            </footer>
        </StandardDialog>
    }

    renderThumbnail(doc) {
        if(!doc.thumbnails || doc.thumbnails.length < 1) return <div></div>
        let thumb = findBestThumbnail(doc.thumbnails)
        if(thumb && thumb.src) return <img
            src={this.props.docserver.url+thumb.src}
            title={doc.title + " thumbnail"}/>
        return <div>thumbnail error</div>
    }
}
