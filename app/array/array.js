import {ViewBase} from "./../../src/view/view-base.js";

export default class ArrayBinding extends ViewBase {
    static get properties() {
        return ["items"];
    }

    connectedCallback() {
        super.connectedCallback();
        this.items = crsbinding.observation.observe([{caption: "Item 1"}]);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.items = null;
    }

    add() {
        this.items.push({caption: `Item ${this.items.length + 1}`});
    }

    remove() {
        this.items.pop();
    }

}