import {BindableElement} from "../../src/binding/bindable-element.js";

export class ContactsComponent extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get contacts() {
        return this.getProperty("contacts");
    }

    set contacts(newValue) {
        return this.setProperty("contacts", newValue);
    }
}

customElements.define("contacts-details", ContactsComponent);