import {ViewBase} from "./../../src/view/view-base.js";
import "./person-component.js";

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
                contacts: [
                    {
                        cell: "Cell 1"
                    },
                    {
                        cell: "Cell 2"
                    }
                ]
            }
        ]);
    }

    debug() {
        this.persons = crsbinding.observation.observe([
            {
                firstName: "First Name 3",
                lastName: "Last Name 3",
                contacts: [
                    {
                        cell: "Cell 1"
                    },
                    {
                        cell: "Cell 2"
                    }
                ]
            },
            {
                firstName: "First Name 4",
                lastName: "Last Name 4"
            }
        ]);
    }

    add() {
        const length = this.persons.length + 1;
        this.persons.push(
            crsbinding.observation.observe({
                firstName: `First Name ${length}`,
                lastName: `Last Name ${length}`,
                contacts: [
                    {
                        cell: "Cell 3"
                    },
                    {
                        cell: "Cell 4"
                    }
                ]
            })
        )
    }

    delete() {
        this.persons.pop();
    }
}
