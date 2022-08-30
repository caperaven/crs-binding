import {ViewBase} from "../../src/view/view-base.js";

export default class SharedContext extends ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
        await import("./comp1.js");
        await import("./comp2.js");
    }

    preLoad() {
        this.setProperty("title", "Title 1");
        this.setProperty("value", "Hello World");
        this.setProperty("available", [
            {
                id: 0,
                title: "item 1",
                isSelected: true
            },
            {
                id: 1,
                title: "item 2",
                isSelected: true
            },
            {
                id: 2,
                title: "item 3",
                isSelected: true
            }
        ]);

        crsbinding.data.createArraySync(this, "available", "id", ["title"]).then(syncId => this.syncId = syncId);
    }

    setSelected() {
        const selected = this.getProperty("available").filter(item => item.isSelected == true).map(item => {
            return {
                id: item.id,
                title: item.title,
            }
        })

        this.setProperty("selected", selected);
        crsbinding.data.addArraySync(this.syncId, this, "selected");
    }

    removeShare() {
        crsbinding.data.removeArraySync(this.syncId, this, "selected");
    }
}