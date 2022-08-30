import {ViewBase} from "../../src/view/view-base.js";

export default class Parent2 extends ViewBase {
    async preLoad(setProperty) {
        setProperty("items", [
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
        ])
    };

    load() {
        crsbinding.data.updateUI(this, "items").then(this._measureItems);
        crsbinding.data.makeShared(this, "data", ["title"]);
        super.load();
    }

    _measureItems() {
        const el = document.querySelector(`li`);
        const dim = el.getBoundingClientRect();
        console.log(dim);
    }

    _remove() {

    }
}