import {ViewBase} from "../../src/view/view-base.js";
import "./toolbar-element/toolbar-element.js";

export default class PerspectiveElement extends ViewBase {
    preLoad() {
        this.setProperty("context", this._dataId);
        this.setProperty("selected", "person");

        this.setProperty("model", {
            person: {
                firstName: "John",
                lastName: "Doe",
                age: 20
            },
            address: {
                street1: "Street 1",
                street2: "Street 2",
                street3: "Street 3",
                city: "Some Town",
                zipcode: "777777"
            }
        })
    }
}