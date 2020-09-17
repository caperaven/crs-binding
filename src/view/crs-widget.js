export class Widget extends HTMLElement {
    disconnectedCallback() {
        this._clearElements();
    }

    onMessage(args) {
        this._clearElements();

        this._dataId = args.contextId;
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