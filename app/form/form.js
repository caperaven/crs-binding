import {ViewBase} from "./../../src/view/view-base.js";

export default class Form extends ViewBase {
    async connectedCallback() {
        super.connectedCallback();
        this.title = "Personal Input Form";

        this.data = getData();
    }

    disposeData() {
        // JHR: todo: first time this thing is called the valus appear as normal
        this.data = null;
    }

    print() {
        console.log(this.data.personal);
    }
}

function getData() {
    return {
         personal: {
            firstName: "John",
            lastName: "Doe",
            age: 21
        }
    }
}