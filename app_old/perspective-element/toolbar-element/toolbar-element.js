export class ToolbarElement extends crsbinding.classes.PerspectiveElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async connectedCallback() {
        await super.connectedCallback();
        this.registerEvent(this, "click", this._click.bind(this));
    }

    async _click(event) {
        if (event.target instanceof HTMLButtonElement) {
            this.dispatchEvent(new CustomEvent("action", { detail: event.target.dataset }));
        }
    }
}

customElements.define("toolbar-element", ToolbarElement);