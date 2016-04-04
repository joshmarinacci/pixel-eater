import React from "react";

export default class OpenDocPanel extends React.Component {
    loadDoc(id) {
        this.props.onSelectDoc(id);
    }
    renderDocs(docs) {
        var self = this;
        return docs.map((doc)=> {
            return <li key={doc.id}><button onClick={self.loadDoc.bind(self,doc.id)}>{doc.title}</button></li>
        });
    }
    render() {
        return <div className="body">
            <ul>
                {this.renderDocs(this.props.docs)}
            </ul>
        </div>
    }
}
