class SourceComponent extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get mobi() {
        return import.meta.url.replace(".js", ".mobi.html");
    }

    async update() {
        const value = this.getProperty("value");
        //this.dispatchEvent(new CustomEvent("change", { detail: value }));

        this.dispatchEvent(new CustomEvent("change", {detail: {value: this.counter}}))
        event.stopPropagation();
    }
}

customElements.define("source-component", SourceComponent);