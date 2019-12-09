import {ViewBase} from "./../../src/view/view-base.js";

export default class ClassesBinding extends ViewBase {
    static get properties() {
        return ["title", "isActive"];
    }

    connectedCallback() {
        super.connectedCallback();
        this.title = "Classes Binding";
        this.isActive = true;
        this.background = "blue";
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }
}