import {BindableElement} from "../../src/binding/bindable-element.js";

class InputContacts extends BindableElement{
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get contacts() {
        return this.getProperty("contacts");
    }

    set contacts(newValue) {
        this.setProperty("contacts", newValue);
    }

    onMessage(args) {
        console.log(args);
    }
}

customElements.define("input-contacts", InputContacts);