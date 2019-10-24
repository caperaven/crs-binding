import {ViewBase} from "./../../src/view/view-base.js";
import {observeArray} from "../../src/events/observe-array.js";

export default class View extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    _loaded() {
        super._loaded();
        this.items = observeArray([
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
        this.items = observeArray([
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
}
