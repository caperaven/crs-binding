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

        this._inflatePerson("person-template", "personContainer");
        this._inflatePerson("person-template2", "personContainer2");
        this._inflateCollection();
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

    _inflatePerson(templateId, containerId) {
        const template = this._element.querySelector(`#${templateId}`);
        crsbinding.inflationManager.register("person", template);

        const fragment = crsbinding.inflationManager.get("person", {
            firstName: "John",
            lastName: "Doe",
            age: 20
        });

        this._element.querySelector(`#${containerId}`).appendChild(fragment);
        crsbinding.inflationManager.unregister("person");
    }

    _inflateCollection() {
        const template = this._element.querySelector("#items-template");
        crsbinding.inflationManager.register("items", template);

        const fragment = crsbinding.inflationManager.get("items", this.data);
        this._element.querySelector("#container").appendChild(fragment);
        crsbinding.inflationManager.unregister("items");
    }
}