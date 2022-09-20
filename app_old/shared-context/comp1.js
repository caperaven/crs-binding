class Comp1 extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get hasOwnContext() {
        return false;
    }

    static get observedAttributes() {
        return ["data-uid"];
    }

    attributeChangedCallback() {
        this._dataId = Number(this.dataset.uid);
        this.connectedCallback();
    }

    load() {
        crsbinding.data.updateUI(this, "available");
    }
}

customElements.define("comp-one", Comp1)