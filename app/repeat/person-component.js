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
    }
}

customElements.define("person-comp", PersonComponent);