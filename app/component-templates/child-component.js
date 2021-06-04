import {BindableElement} from "../../src/binding/bindable-element.js";

class ChildComponent extends BindableElement{
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async connectedCallback() {
        await super.connectedCallback();
        this.setProperty("item", this.item);
    }

    // get parent() {
    //     return this._parent;
    // }
    //
    // set parent(newValue) {
    //     this._parent = newValue;
    // }
}

customElements.define("child-component", ChildComponent);