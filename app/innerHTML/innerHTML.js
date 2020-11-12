import {ViewBase} from "../../src/view/view-base.js";

export default class List extends ViewBase {
    async preLoad() {
        this.setProperty("model.value", "<h2>HTML Heading 2</h2>");
        this.setProperty("model.values", [
            {
                title: "<h2>Item 1</h2>"
            },
            {
                title: "<h2>Item 2</h2>"
            },
            {
                title: "<h2>Item 3</h2>"
            }
        ]);
    }

    load() {
        crsbinding.data.updateUI(this, "model.values");
        super.load();
    }
}