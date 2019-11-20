import {ViewBase} from "./../../src/view/view-base.js";

export default class View extends ViewBase {
    connectedCallback() {
        this.title = "Repeat Test Title";
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    _loaded() {
        super._loaded();
        this.persons = crsbinding.observation.observe([
            {
                firstName: "First Name 1",
                lastName: "Last Name 1",
                contacts: [
                    {
                        cell: "Cell 1"
                    },
                    {
                        cell: "$context.title"
                    }
                ]
            },
            {
                firstName: "First Name 2",
                lastName: "Last Name 2"
            }
        ]);
    }

    debug() {
    }

    add() {
    }

    delete() {
        this.items.splice(1, 1);
    }
}
