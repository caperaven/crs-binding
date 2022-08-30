import {ViewBase} from "../../src/view/view-base.js";

export default class Binding1 extends ViewBase {
    async preLoad(setPropertyCallback) {
        setPropertyCallback("items", [
            { title: "Item 1", isDone: false },
            { title: "Item 2", isDone: false }
        ]);
    }

    load() {
        crsbinding.data.updateUI(this, "items");
        super.load();
    }

    addItem() {
        const items = crsbinding.data.array(this, "items");
        const title = prompt("Title", `Item ${items.length + 1}`);
        items.push({title: title, isDone: false});
    }

    removeSelected() {
        const items = crsbinding.data.getValue(this, "items").filter(item => item.isSelected != true);
        this.setProperty("items", items);
    }
}