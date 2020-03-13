import {ViewBase} from "./../../src/view/view-base.js";

/**
 * TODO: JHR - test the class and style binding to ensure it works with the repeat behaviours.
 */

export default class ArrayBinding extends ViewBase {
    connectedCallback() {
        super.connectedCallback();

        this.data = crsbinding.observation.observe({
            get properties() {return ["items"]},

            items: [{caption: "Item 1", editing: true}],  // should not need to put observe on this property

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
            },

            move() {
                const fromIndex = 3;
                const toIndex = 1;

                // insert(atIndex, 0, itemsToAdd)
                this.data.items.splice(toIndex, 0, ...this.data.items.splice(fromIndex, 1));
            }
        });
    }

    disconnectedCallback() {
        super.disconnectedCallback();
        this.data.items = null;
    }

    add() {
        this.data.items.push({caption: `Item ${this.data.items.length + 1}`, editing: true});
    }

    remove() {
        this.data.items.pop();
    }

    itemClick(event) {
        let target = event.target;
        if (target.nodeName != "LI") {
            target = target.parentElement;
        }
        
        const index = Array.from(target.parentElement.children).indexOf(target);
        const data = this.data.items[index];
        
        this.model = data;
    }
}