import {ViewBase} from "./../../src/view/view-base.js";

export default class Form extends ViewBase {
    async connectedCallback() {
        this.title = "Personal Input Form";
        this.selectedId = 2;
        this.items = getData();
        super.connectedCallback();
    }

    disposeData() {
        this.data = null;
    }
}

function getData() {
    return [
        {
            id: 1,
            caption: "Item 1"
        },
        {
            id: 2,
            caption: "Item 2"
        },
        {
            id: 3,
            caption: "Item 3"
        }
    ]
}