import {ViewBase} from "./../../src/view/view-base.js";

export default class View extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
        this.title = "Repeat Test Title";
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
                contacts: crsbinding.observation.observe([
                    {
                        cell: "Cell 1"
                    },
                    {
                        cell: "Cell 2"
                    }
                ])
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
