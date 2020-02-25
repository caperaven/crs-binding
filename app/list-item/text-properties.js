import {BindableElement} from "../../src/binding/bindable-element.js";

export class TextProperties extends BindableElement {
    static get properties() {
        return ["model"]
    }

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
        console.log(this.model);
    }

    async disconnectedCallback() {
        crsbinding.observation.releaseObserved(this.model);
        delete this.model;
    }
}

customElements.define('text-properties', TextProperties);