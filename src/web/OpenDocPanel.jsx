import React from "react";
import Dialog from "./Dialog.jsx";
import Config from "./Config"

export default class OpenDocPanel extends React.Component {
    loadDoc(id) {
        this.props.onSelectDoc(id);
    }
    deleteDoc(id) {
        this.props.onDeleteDoc(id);
    }
    renderDocs(docs) {
        var self = this;
        return docs.map((doc)=> {
            return <li key={doc.id}>
                <button onClick={self.loadDoc.bind(self,doc.id)}>{doc.title}</button>
                <button onClick={self.deleteDoc.bind(self,doc.id)}>delete</button>
                <img src={this.generatePreviewURL(doc.id)}/>
            </li>
        });
    }
    render() {
        return <Dialog visible={this.props.visible}>
            <header>Open</header>
            <div className="body">
                <ul>
                    {this.renderDocs(this.props.docs)}
                </ul>
            </div>
            <footer>
                <div className="hbox right">
                    <button onClick={this.props.onCanceled}>cancel</button>
                </div>
            </footer>
        </Dialog>
    }

    generatePreviewURL(id) {
        return Config.url("/preview/")
            + id
            + "?download=false";
    }
}
