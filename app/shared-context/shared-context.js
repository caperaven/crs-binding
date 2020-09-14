import {ViewBase} from "../../src/view/view-base.js";

export default class SharedContext extends ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        await import("./comp1.js");
        await import("./comp2.js");
    }

    preLoad() {
        this.setProperty("title", "Title 1");
        this.setProperty("value", "Hello World");
    }
}