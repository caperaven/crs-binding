import {ViewBase} from "../../src/view/view-base.js";

export default class Project5 extends ViewBase {
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
    }

    load() {
        crsbinding.data.updateUI(this, "items");
        super.load();
    }

    propertyChanged(property, value) {
        const fnName = `${property}Changed`;
        if (this[fnName] != null) {
            crsbinding.idleTaskManager.add(() => this[fnName](value));
        }
    }

    selectedIdChanged(value) {
        const item = crsbinding.data.array(this, "items").find(item => item.id == value);
        crsbinding.data.setProperty(this, "data", item);
    }
}