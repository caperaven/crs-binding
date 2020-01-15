import {BindableElement} from "./../../src/binding/bindable-element.js";

class TestComponent extends BindableElement {
    static get properties() {
        return ["title", "model", "age"]
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

    get age() {
        return this.getProperty("age");
    }

    set age(newValue) {
        this.setProperty("age", newValue);
    }

    get model() {
        return this._model;
    }

    set model(newValue) {
        this._model = newValue;
        console.log(this._model);
    }

    get isActive() {
        return this.getProperty("isActive");
    }

    set isActive(newValue) {
        this.setProperty("isActive", newValue)
    }

    async connectedCallback() {
        super.connectedCallback();
        this.observeAttributes(["hidden"]);
        this.age = 10;
    }

    async disconnectedCallback() {
        super.disconnectedCallback();
        this.model = null;
        this.title = null;
        this.age = null;
    }

    btnClicked(...args) {
        console.log(args);
    }

    titleChanged() {
        console.log(this.title);
    }

    hiddenAttributeChanged(value, oldValue) {
        console.log(value);
        console.log(oldValue);
    }

    isActiveChanged() {
        console.log(this.isActive);
    }
}

customElements.define("test-component", TestComponent);