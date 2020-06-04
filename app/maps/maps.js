import {ViewBase} from "../../src/view/view-base.js";

export default class Maps extends ViewBase {
    get data() {
        return this.getProperty("data");
    }

    set data(newValue) {
        this.setProperty("data", newValue);
    }

    async connectedCallback() {
        await super.connectedCallback();

        this.data = new Map([
            [0, {title: "Item 1"}],
            [1, {title: "Item 2"}],
            [2, {title: "Item 3"}],
            [3, {title: "Item 4"}],
        ])
    }

    add() {
    }

    remove() {
    }

    update() {
    }
}