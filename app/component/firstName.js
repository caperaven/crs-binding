import {BindableElement} from "../../src/binding/bindable-element.js";

class FirstName extends BindableElement{
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get value() {
        return this.getProperty("value");
    }

    set value(newValue) {
        this.setProperty("value", newValue);
    }
}

customElements.define("first-name", FirstName);