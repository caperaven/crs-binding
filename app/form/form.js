import {ViewBase} from "./../../src/view/view-base.js";

export default class Form extends ViewBase {
    async connectedCallback() {
        super.connectedCallback();
        this.title = "Personal Input Form";
        this.data = getData();
    }

    disposeData() {
        //JHR: TODO: NB: DEBUG THIS AND MAKE SURE EVERYTHING GETS DESTROYED
        this.data = null;
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