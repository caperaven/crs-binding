import {BindableElement} from "./../../src/binding/bindable-element.js";

class TestComponent extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get title() {
        return this.getProperty("title");
    }

    set title(newValue) {
        this.setProperty("title", newValue);
    }

    async connectedCallback() {
        super.connectedCallback();
    }

    async disconnectedCallback() {
        super.disconnectedCallback();
    }
}

customElements.define("test-component", TestComponent);