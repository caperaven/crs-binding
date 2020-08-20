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

        const template = this._element.querySelector("#items-template");
        crsbinding.inflationManager.register("items", template);

        const fragment = crsbinding.inflationManager.get("items", this.data);
        this._element.querySelector("#container").appendChild(fragment);
    }

    preLoad() {
        this.data = getRenderData();
    }

    async disconnectedCallback() {
        crsbinding.inflationManager.unregister("items");
        super.disconnectedCallback();
    }
}