export class Widget extends HTMLElement {
    disconnectedCallback() {
        this._clearElements();
        delete this._dataId;
    }

    onMessage(args) {
        this._clearElements();

        let id = args.context;
        if (id && typeof id == "object") {
            id = id.__uid || id._dataId;
        }

        this._dataId = id;
        this.innerHTML = args.html;

        crsbinding.parsers.parseElements(this.children, this._dataId);
    }

    _clearElements() {
        for (let child of this.children) {
            crsbinding.observation.releaseBinding(child);
        }
    }
}

customElements.define('crs-widget', Widget);