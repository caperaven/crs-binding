class ParseElementComponent extends crsbinding.classes.BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async preLoad() {
        await crsbinding.translations.add({
            firstName: "First Name"
        });

        this.setProperty("firstName", "John");
    }
}

customElements.define("parse-element", ParseElementComponent);