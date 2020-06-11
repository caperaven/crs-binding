import {BindableElement} from "../../src/binding/bindable-element.js";

export class Menu extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }
}

customElements.define("main-menu", Menu);