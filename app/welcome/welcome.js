export default class Welcome extends crsbinding.classes.ViewBase {
    get mobi() {
        return import.meta.url.replace(".js", ".mobi.html");
    }

    async connectedCallback() {
        await super.connectedCallback();
    }
}