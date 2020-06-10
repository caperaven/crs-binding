import {BindableElement} from "../../src/binding/bindable-element.js";

export class Menu extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get visible() {
        return this._visible;
    }

    set visible(newValue) {
        this._visible = newValue;
    }

    async connectedCallback() {
        this._toggleHandler = this._toggle.bind(this);
        crsbinding.events.emitter.on("toggle-menu", this._toggleHandler);
        this.visible = true;
        await super.connectedCallback();
    }

    async disconnectedCallback() {
        crsbinding.events.emitter.remove("toggle-menu", this._toggleHandler);
        this._toggleHandler = null
        await super.disconnectedCallback();
    }

    _toggle() {
        this.visible = !this.visible;
        this.style.display = this.visible == true ? "block" : "none";
    }
}

customElements.define("main-menu", Menu);