import React, {Component} from "react";
import {Dialog, VBox} from "appy-comps";
import Config from "./Config"

export default class OpenDocPanel extends Component {
    loadDoc(id) {
        this.props.onSelectDoc(id);
    }
    deleteDoc(id) {
        this.props.onDeleteDoc(id);
    }
    renderDocs(docs) {
        return docs.map((doc)=> {
            return <li key={doc.id}>
                <button onClick={this.loadDoc.bind(this,doc.id)}>{doc.title}</button>
                <button onClick={this.deleteDoc.bind(this,doc.id)}>delete</button>
                <img src={this.generatePreviewURL(doc.id)} alt="screenshot"/>
            </li>
        });
    }
    render() {
        return <Dialog visible={true}>
            <header>Open</header>
            <VBox>
                <ul>
                    {this.renderDocs(this.props.docs)}
                </ul>
            </VBox>
            <footer className="children-right">
                <button onClick={this.props.onCanceled}>cancel</button>
            </footer>
        </Dialog>
    }

    generatePreviewURL(id) {
        return Config.url("/preview/")
            + id
            + "?download=false";
    }
}
