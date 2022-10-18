class MyComponent extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get mobi() {
        return import.meta.url.replace(".js", ".mobi.html");
    }
}

customElements.define("my-component", MyComponent);