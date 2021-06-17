class FragmentComponent extends crsbinding.classes.BindableElement {
    get hasOwnContext() {
        return false;
    }

    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    static get observedAttributes() {
        return ["data-uid"];
    }

    attributeChangedCallback() {
        this._dataId = Number(this.dataset.uid);
        this.connectedCallback();
    }
}

customElements.define("fragment-component", FragmentComponent);