import {ViewBase} from "../../src/view/view-base.js";

export default class Binding1 extends ViewBase {
    preLoad() {
        this.setProperty("items", ["item 1", "item 2", "item 3"]);
    }

    load() {
        crsbinding.data.updateUI(this, "items");
        super.load();
    }
}