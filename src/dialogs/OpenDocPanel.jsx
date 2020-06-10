import React, {Component} from "react";
import {StandardDialog, Spacer} from "appy-comps"

export default class OpenDocPanel extends Component {
    loadDoc(id) {
        this.props.onSelectDoc(id);
    }
    deleteDoc(id) {
        this.props.onDeleteDoc(id);
    }
    renderDocs(docs) {
        console.log("docs is",docs)
        return docs.map((doc)=> {
            return <li key={doc._id}>
                <button onClick={this.loadDoc.bind(this,doc._id)}>{doc.title}</button>
                <button onClick={this.deleteDoc.bind(this,doc._id)}>delete</button>
                {this.renderThumbnail(doc)}
            </li>
        });
    }
    render() {
        return <StandardDialog visible={true}>
            <header>Open</header>
            <main>
                <ul>
                    {this.renderDocs(this.props.docs)}
                </ul>
            </main>
            <footer className="children-right">
                <Spacer/>
                <button onClick={this.props.onCanceled}>cancel</button>
            </footer>
        </StandardDialog>
    }

    renderThumbnail(doc) {
        if(!doc.thumbnails || doc.thumbnails.length < 1) return <div></div>
        let thumb = doc.thumbnails[0]
        if(thumb.src) return <img src={this.props.docserver.url+thumb.src} style={{border:'1px solid black' }}/>
        return <div>thumbnail error</div>
    }
}
