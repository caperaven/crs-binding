import {BindableElement} from "../../src/binding/bindable-element.js";
import "./input-contacts.js";

export class InputForm extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get data() {
        return this.getProperty("data");
    }

    set data(newValue) {
        this.setProperty("data", newValue);
    }
}

customElements.define("input-form", InputForm);