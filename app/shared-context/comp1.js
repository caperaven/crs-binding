class Comp1 extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get hasOwnContext() {
        return false;
    }

    constructor() {
        super();
        this._dataId = this.parentElement.viewModel._dataId;
    }
}

customElements.define("comp-one", Comp1)