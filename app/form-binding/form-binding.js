import {ViewBase} from "../../src/view/view-base.js";

export default class FormBinding extends ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        crsbinding.translations.add({
            firstName: "First Name",
            lastName: "Last Name",
            age: "Age"
        }, "screen")
    }

    async disconnectedCallback() {
        crsbinding.translations.remove("screen");
        await super.disconnectedCallback();
    }

    async changeValues() {
        this.setProperty("firstName", "Peter");
        this.setProperty("lastName", "Parker");
        this.setProperty("age", 30);
    }

    async addInput() {

    }

    async removeInput() {

    }
}