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

    get priorities() {
        return this.getProperty("priorities");
    }

    set priorities(newValue) {
        /**
         * When changing list items
         */
        this.setProperty("priorities", newValue);
    }

    _loaded() {
        crsbinding.data.makeShared(this._dataId, "selectedItem", ["title"]);

        this.items = createItems(5);
        super._loaded();
    }

    addItem() {
        const array = this.items;
        const id = array.length == 0 ? 0 : array[array.length -1].id + 1;
        const newItem = createItem(id);

        array.push(newItem);
    }

    removeItem() {
        if (this.selectedItem != null) {
            const array = this.items;

            const id = this.selectedItem.id;
            const index = array.findIndex(item => item.id == id);
            const length = array.length;
            let newIndex = length == 0 ? -1 : index + 1;

            if (newIndex != -1) {
                if (newIndex > length - 1) {
                    newIndex = length - 2;
                }
            }

            this.selectedItem = newIndex == -1 ? null : array[newIndex];

            array.splice(index, 1);
        }
    }

    popItem() {
        this.items.pop();
    }

    selectItem(event) {
        if (event.target.nodeName == "LI") {
            const selectedId = event.target.dataset.id;
            this.selectedItem = this.items.find(item => item.id == selectedId);
        }
    }
}