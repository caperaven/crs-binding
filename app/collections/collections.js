import {ViewBase} from "../../src/view/view-base.js";
import {createItems, createItem, createPriorities, createTask} from "./data.js";
import "./tasks-summary.js";

export default class Collections extends ViewBase {
    get items() {
        return this.getProperty("items");
    }

    set items(newValue) {
        this.setProperty("items", newValue);
    }

    get doneItems() {
        return this.getProperty("doneItems");
    }

    set doneItems(newValue) {
        this.setProperty("doneItems", newValue);
    }

    get selectedItem() {
        return this.getProperty("selectedItem")
    }

    set selectedItem(newValue) {
        const updates = [];

        const oldItem = this.selectedItem;
        if (oldItem != null) {
            updates.push(oldItem.__uid);
            oldItem.__isSelected = false;
        }

        updates.push(newValue.__uid);
        newValue.__isSelected = true;
        this.setProperty("selectedItem", newValue);

        for (let update of updates) {
            crsbinding.data.updateUI(update, "__isSelected");
        }
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
        this.doneItems = [];
        this.priorities = createPriorities();
        this.translations = {
            remove: "Remove"
        };

        super.connectedCallback();
    }

    load() {
        crsbinding.data.makeShared(this, "selectedItem", ["title", "priority"]);
        crsbinding.data.updateUI(this, "items");
        super.load();
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
        if (event.target.nodeName == "LI") {
            const selectedId = Number(event.target.dataset.id);
            this.selectedItem = this.items.find(item => item.id == selectedId);
        }
    }

    removeThis(event) {
        const fromArray = this.items;
        const toArray = this.doneItems;

        const id = event.target.parentElement.dataset.id;
        const index = fromArray.findIndex(item => item.id == id);
        const item = fromArray[index];

        this.removeItemById(id);
        toArray.push(item);
    }

    removeDone(event) {
        const fromArray = this.doneItems;
        const toArray = this.items;

        if (event.target.nodeName == "LI") {
            const id = event.target.dataset.id;
            const index = fromArray.findIndex(item => item.id == id);
            const obj = fromArray[index];
            fromArray.splice(index, 1);
            toArray.push(obj);
        }
    }

    addTask() {
        const array = crsbinding.data.array(this, "selectedItem.tasks");
        array.push(createTask(this.selectedItem.tasks.length, this.selectedItem.id));
    }

    popTask() {
        const array = crsbinding.data.array(this, "selectedItem.tasks");
        array.pop();
    }

    changeTask() {
        const item = this.selectedItem.tasks[0];
        crsbinding.data.setProperty(item, "title", "Hello World");
    }

    updateTaskProperty() {
        const item = this.selectedItem.tasks[0];
        item.title = "Hello World";
        crsbinding.data.updateUI(item);
    }
}