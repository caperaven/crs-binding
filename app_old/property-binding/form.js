export class Form extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get model() {
        return this.getProperty("model");
    }

    set model(newValue) {
        this.setProperty("model", newValue);
    }
}

customElements.define("my-form", Form);