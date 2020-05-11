import {ViewBase} from "../../src/view/view-base.js";
import {createItems, createItem, createPriorities} from "./data.js";
import "./tasks-summary.js";

export default class Collections extends ViewBase {
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
        this.setProperty("priorities", newValue);
    }

    get translations() {
        this.getProperty("translations");
    }

    set translations(newValue) {
        this.setProperty("translations", newValue);
    }

    async connectedCallback() {
        this.items = createItems(5);
        this.priorities = createPriorities();
        this.translations = {
            remove: "Remove"
        };

        super.connectedCallback();
    }

    _loaded() {
        crsbinding.data.makeShared(this._dataId, "selectedItem", ["title", "priority"]);
        crsbinding.data.updateUI(this._dataId, "items");
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
            const id = this.selectedItem.id;
            this.removeItemById(id);
        }
    }

    removeItemById(id) {
        const array = this.items;

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

    popItem() {
        const array = this.items;
        this.selectedItem = array.length == 1 ? null : array[array.length -2];
        this.items.pop();
    }

    selectItem(event) {
        if (this.selectedItem != null) {
            this.selectedItem.__isSelected = false;
        }

        if (event.target.nodeName == "LI") {
            const selectedId = event.target.dataset.id;
            this.selectedItem = this.items.find(item => item.id == selectedId);
            this.selectedItem.__isSelected = true;
        }
    }

    removeThis(event) {
        const id = event.target.parentElement.dataset.id;
        this.removeItemById(id);
    }
}