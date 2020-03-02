import {BindableElement} from "../../src/binding/bindable-element.js";

export class TextProperties extends BindableElement {
    get model() {
        return this.getProperty("model");
    }

    set model(newValue) {
        this.setProperty("model", newValue);
    }

    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async connectedCallback() {
        await super.connectedCallback();
    }

    async disconnectedCallback() {
        super.disconnectedCallback();
        this.model = null;
    }
}

customElements.define('text-properties', TextProperties);