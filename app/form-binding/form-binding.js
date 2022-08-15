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
        const template = this._element.querySelector("#tplAge");
        const instance = template.content.cloneNode(true);
        this._element.querySelector('[data-dataset="my-dataset"]').appendChild(instance);
    }

    async removeInput() {
        const element = this._element.querySelector("[data-id='lblAge']");
        element?.parentElement.removeChild(element);
    }
}