import {ViewBase} from "../../src/view/view-base.js";

export default class MasterDetail extends ViewBase {
    preLoad() {
        this.setProperty("items", [
            {
                id: 0,
                title: "Item 1",
                paragraph: "Hello to item 1"
            },
            {
                id: 1,
                title: "Item 2",
                paragraph: "Hello to item 2"
            },
            {
                id: 2,
                title: "Item 3",
                paragraph: "Hello to item 3"
            }
        ]);
    }

    load() {
        crsbinding.data.updateUI(this, "items");
        crsbinding.data.makeShared(this, "data", ["title"]);
        super.load();
    }

    removeSelected() {
        const items = this.getProperty("items");
        const remainder = items.filter(item => item.selected != true);
        this.setProperty("items", items);
        // for (let selected of selectedItems) {
        //     this.setSelected(items, selected);
        //     items.splice(items.indexOf(selected), 1);
        // }
    }

    setSelected(items, selected) {
        const data = this.getProperty("data");
        if (selected === data) {
            this.setProperty("data", null);
        }
    }

    selected(event) {
        console.log(event.target);
    }

}