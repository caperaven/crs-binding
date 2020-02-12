import {ViewBase} from "./../../src/view/view-base.js";

export default class List extends ViewBase {
    async connectedCallback() {
        super.connectedCallback();
        this.title = "List Example";
        this.items = getData(10);
    }
}

function getData(count) {
    const result = [];
    for (let i = 0; i < count; i++) {
        result.push({
            id: i,
            caption: `Item ${i}`,
            isActive: true
        })
    }
    return result;
}