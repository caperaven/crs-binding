import {BindableElement} from "../../src/binding/bindable-element.js";

export class PersonComponent extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }
}

customElements.define("simple-component", PersonComponent);