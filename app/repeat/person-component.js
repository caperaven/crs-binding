import {BindableElement} from "../../src/binding/bindable-element.js";

class PersonComponent extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get person() {
        return this.getProperty("person");
    }

    set person(newValue) {
        this.setProperty("person", newValue);
        console.log(newValue);
    }

    async connectedCallback() {
        super.connectedCallback();
        console.log("person component loaded");
    }
}

customElements.define("person-comp", PersonComponent);