import {BindableElement} from "../../src/binding/bindable-element.js";

export class TextProperties extends BindableElement {
    static get properties() {
        return ["model"]
    }

    get model() {
        return this.getProperty("model");
    }

    set model(newValue) {
        /**
         * On set of the property using the set property, the events on the isting item needs to be compied over.
         * setting the property to null will release the item from this and then also delete the _model thing.
         */
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
        this.model = null;
        super.disconnectedCallback();
    }
}

customElements.define('text-properties', TextProperties);