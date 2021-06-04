import {BindableElement} from "../../src/binding/bindable-element.js";

class ChildComponent extends BindableElement{
    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    get parent() {
        return this.getProperty("parent");
    }

    set parent(newValue) {
        this.setProperty("parent", newValue);
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