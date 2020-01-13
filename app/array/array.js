import {ViewBase} from "./../../src/view/view-base.js";

export default class ArrayBinding extends ViewBase {
    static get properties() {
        return ["data"];
    }

    connectedCallback() {
        super.connectedCallback();

        this.data = crsbinding.observation.observe({
            items: [{caption: "Item 1"}],  // should not need to put observe on this property

            // JHR: Add  it so that when you call a function it uses call with the context as this.

            add() {
                this.data.items.push({caption: `Item ${this.items.length + 1}`})
            },

            remove() {
                this.data.items.pop();
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.data.items = null;
    }

    add() {
        this.data.items.push({caption: `Item ${this.data.items.length + 1}`});
    }

    remove() {
        this.data.items.pop();
    }

}