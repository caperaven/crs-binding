import {BindableElement} from "../../src/binding/bindable-element.js";

export class DetailsComponent extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }
}

customElements.define("simple-component", DetailsComponent);