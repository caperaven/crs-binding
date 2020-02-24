import {BindableElement} from "../../src/binding/bindable-element.js";

export class SimpleComponent extends BindableElement {
    static get properties() {
        return ["isActive"]
    }
    
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get isActive() {
        return this.getProperty("isActive");
    }
    
    set isActive(newValue) {
        this.setProperty("isActive", newValue);
    }
}

customElements.define("simple-component", SimpleComponent);