import {ViewBase} from "./../../src/view/view-base.js";

export default class ArrayBinding extends ViewBase {
    static get properties() {
        return ["data"];
    }

    connectedCallback() {
        super.connectedCallback();

        let item = {
            caption: "Item 1", items: [
                {
                    caption: "Test"
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
}