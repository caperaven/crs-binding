import {ViewBase} from "./../../src/view/view-base.js";

export default class View extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    _loaded() {
        super._loaded();
        this.items = crsbinding.observation.observe([
            {
                value: "1",
                unit: "fr"
            },
            {
                value: "2",
                unit: "fr"
            },
            {
                value: "3",
                unit: "fr"
            }
        ]);
    }

    debug() {
        this.items = crsbinding.observation.observe([
            {
                value: "5",
                unit: "em"
            },
            {
                value: "6",
                unit: "em"
            },
            {
                value: "7",
                unit: "em"
            }
        ]);
    }

    add() {
        this.items.push({
            value: "8",
            unit: "em"
        })
    }

    delete() {
        this.items.splice(1, 1);
    }
}
