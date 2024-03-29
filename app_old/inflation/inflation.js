import {ViewBase} from "../../src/view/view-base.js";
import {getRenderData} from "./data.js";

export default class Component extends ViewBase {
    get data() {
        return this.getProperty("data");
    }

    set data(newValue) {
        this.setProperty("data", newValue);
    }

    async connectedCallback() {
        await super.connectedCallback();

        await this._inflatePerson("person-template", "personContainer");
        await this._inflatePerson("person-template2", "personContainer2");
        await this._inflateCollection();
    }

    preLoad() {
        this.data = getRenderData();
    }

    load() {
        crsbinding.data.updateUI(this, "data");
        super.load();
    }

    async disconnectedCallback() {
        crsbinding.inflationManager.unregister("items");
        super.disconnectedCallback();
    }

    async _inflatePerson(templateId, containerId) {
        const template = this._element.querySelector(`#${templateId}`);
        await crsbinding.inflationManager.register("person", template);

        const fragment = crsbinding.inflationManager.get("person", {
            firstName: "John",
            lastName: "Doe",
            age: 20
        });

        this._element.querySelector(`#${containerId}`).appendChild(fragment);
        crsbinding.inflationManager.unregister("person");
    }

    async _inflateCollection() {
        const template = this._element.querySelector("#items-template");
        await crsbinding.inflationManager.register("items", template);

        const fragment = crsbinding.inflationManager.get("items", this.data);
        this._element.querySelector("#container").appendChild(fragment);
        crsbinding.inflationManager.unregister("items");
    }
}