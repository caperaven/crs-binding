import {BindableElement} from "./../../../src/binding/bindable-element.js";

export class Pages extends BindableElement {
    get html() {
        return null;
    }

    get context() {
        return this.getProperty("context");
    }

    set context(newValue) {
        this.setProperty("context", newValue);
    }

    async connectedCallback() {
        this._templates = [];
        super.connectedCallback();
    }

    async disconnectedCallback() {
        this._templates.forEach(id => crsbinding.elementStoreManager.unregister(id));
        super.disconnectedCallback();
    }

    load() {
        const elements = this.querySelectorAll("template");

        for (let element of elements) {
            element.parentElement.removeChild(element);
            const id = `${this.id}_${element.id}`;
            this._templates.push(id);
            crsbinding.elementStoreManager.register(id, element);
        }
    }
}

customElements.define("crs-pages", Pages);