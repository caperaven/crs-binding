import {ViewBase} from "./../../src/view/view-base.js";
import "./details.js";
import "./person.js";
import "./person-summery.js";

export default class ComplexBinding extends ViewBase {
    get items() {
        return this.getProperty("items");
    }

    set items(newValue) {
        this.setProperty("items", newValue);
    }

    get selectedItem() {
        return this.getProperty("selectedItem");
    }

    set selectedItem(newValue) {
        this.setProperty("selectedItem", newValue);
    }

    async connectedCallback() {
        super.connectedCallback();
        this.items = getData(this.items);
    }

    select(event) {
        const id = event.target.dataset.id;
        const selected = this.items.find(item => item.id == id);
        this.selectedItem = selected;
    }
}

function getData(prior) {
    const result = [];
    for (let i = 0; i < 10; i++) {
        result.push({
            id: i,
            code: `Code ${i}`,
            details: {
                firstName: `First Name ${i}`,
                lastName: `Last Name ${i}`,
                age: 20 + i,

                contacts: [
                    {
                        description: `cell number for ${i}`,
                    },
                    {
                        description: `phone number for ${i}`,
                    },
                    {
                        description: `fax number for ${i}`,
                    }
                ]
            }
        })
    }
    return crsbinding.observation.observe(result, prior);
}