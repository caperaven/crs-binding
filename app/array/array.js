import {ViewBase} from "./../../src/view/view-base.js";

/**
 * TODO: JHR - test the class and style binding to ensure it works with the repeat behaviours.
 */

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
                this.data.items.push({caption: `Item ${this.data.items.length + 1}`, editing: true})
            },

            remove() {
                this.data.items.pop();
                this.data.items.pop();
                this.data.items.pop();
            },

            splice() {
                this.data.items.splice(0, 3);
            },

            splice2() {
                this.data.items.splice(1, 2, {caption: `Item - splice ${this.data.items.length + 1}`}, {caption: `Item - splice ${this.data.items.length + 2}`});
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