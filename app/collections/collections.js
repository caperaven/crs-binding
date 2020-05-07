import {ViewBase} from "../../src/view/view-base.js";
import {createItems, createItem} from "./data.js";

export default class Component extends ViewBase {
    get items() {
        return this.getProperty("items");
    }

    set items(newValue) {
        this.setProperty("items", newValue);
    }

    get selectedItem() {
        return this.getProperty("selectedItem")
    }

    set selectedItem(newValue) {
        this.setProperty("selectedItem", newValue);
    }

    _loaded() {
        this.items = createItems(5);
        super._loaded();
    }

    addItem() {
        const array = this.items;
        const id = array[array.length -1].id + 1;
        const newItem = createItem(id);

        array.push(newItem);
    }

    removeItem() {

    }

    popItem() {
        this.items.pop();
    }

    selectItem(event) {
        if (event.target.nodeName == "LI") {
            const selectedId = event.target.dataset.id;

            console.log(selectedId);
        }
    }
}