class MyComponent extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    preLoad() {
        this.setProperty("title", "My Component");
    }
}

customElements.define("my-component", MyComponent);