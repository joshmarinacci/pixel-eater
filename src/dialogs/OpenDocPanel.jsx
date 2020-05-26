import React, {Component} from "react";
import {StandardDialog, Spacer} from "appy-comps"
import Config from "../Config.js"

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
                <img src={this.generatePreviewURL(doc._id)} alt="screenshot"/>
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

    generatePreviewURL(id) {
        return Config.url("/preview/")
            + id
            + "?download=false";
    }
}
