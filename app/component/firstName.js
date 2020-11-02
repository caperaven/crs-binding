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

    load() {
        this.setProperty("model", {translations: {firstName: "First Name", firstNameOld: ""}})
    }
}

customElements.define("first-name", FirstName);