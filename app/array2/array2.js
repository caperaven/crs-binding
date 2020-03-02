import {ViewBase} from "./../../src/view/view-base.js";

export default class ArrayBinding extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
        this.level = "100px";
        this.background = "hotpink";
        this.color = "white";

        let item = {
            caption: "Item 1", items: [
                {
                    caption: "Test",
                    level: "100px"
                }
            ]
        };

        this.data = crsbinding.observation.observe(
            {
                items: [],
                items2: [],
            });

        // Note GM: I'm using the same object for both arrays. I have a scenario where I have two list, but they use same underlying object.
        this.data.items.push(item);
        this.data.items2.push(item); // Note GM: I'm only adding one item to each array, but it shows 2 per repeat
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.data.items = null;
        this.data.items2 = null;
    }

    update() {
        const item = this.data.items[0].items[0];
        item.level = "10px";
    }
}