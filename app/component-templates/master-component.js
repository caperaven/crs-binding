import {BindableElement} from "../../src/binding/bindable-element.js";

class MasterComponent extends BindableElement {
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get items() {
        return this.getProperty("items");
    }

    set items(newValue) {
        this.setProperty("items", newValue);
    }

    async preLoad() {
        const path = crsbinding.utils.relativePathFrom(import.meta.url, "./child-component.html");
        await crsbinding.templates.load("ChildComponent", path);
    }
}

customElements.define("master-component", MasterComponent);