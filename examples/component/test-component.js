import {BindableElement} from "./../../src/binding/bindable-element.js";

class TestComponent extends BindableElement {
    static get properties() {
        return ["title", "model"]
    }

    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get title() {
        return this.getProperty("title");
    }

    set title(newValue) {
        this.setProperty("title", newValue);
    }

    get model() {
        return this._model;
    }

    set model(newValue) {
        this._model = newValue;
        console.log(this._model);
    }

    async connectedCallback() {
        super.connectedCallback();
    }

    async disconnectedCallback() {
        super.disconnectedCallback();
        this.model = null;
        this.title = null;
    }

    btnClicked(...args) {
        console.log(args);
    }
}

customElements.define("test-component", TestComponent);