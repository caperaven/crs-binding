class GroupBox extends crsbinding.classes.BindableElement {
    get shadowDom() {
        return true;
    }

    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    preLoad() {
        this.setProperty("title", this.dataset.title);
    }
}

customElements.define("group-box", GroupBox);