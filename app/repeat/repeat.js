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
                value: "item 1"
            },
            {
                value: "item 2"
            },
            {
                value: "item 3"
            }
        ]);
    }
}
