import {ViewBase} from "./../../src/view/view-base.js";

export default class StyleBinding extends ViewBase {
    static get properties() {
        return ["title", "isActive"];
    }

    connectedCallback() {
        super.connectedCallback();
        this.title = "Style Binding";
        this.isActive = true;
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }
}