import "./group-box.js"

export default class ShadowDom extends crsbinding.classes.ViewBase {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async connectedCallback() {
        await super.connectedCallback();
    }

    async greet() {
        this.setProperty("title", "test");
    }
}