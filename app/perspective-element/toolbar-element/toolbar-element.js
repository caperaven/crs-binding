export class ToolbarElement extends crsbinding.classes.PerspectiveElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async connectedCallback() {
        await super.connectedCallback();
    }
}

customElements.define("toolbar-element", ToolbarElement);