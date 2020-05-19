import {ViewBase} from "../../src/view/view-base.js";
import {getRenderData} from "./data.js";

export default class Component extends ViewBase {
    async connectedCallback() {
        super.connectedCallback();

        const template = this._element.querySelector("#items-template");
        crsbinding.inflationManager.register("items", template);

        const data = getRenderData();

        const fragment = crsbinding.inflationManager.get("items", data);
        this._element.querySelector("#container").appendChild(fragment);
    }

    async disconnectedCallback() {
        crsbinding.inflationManager.unregister("items");
        super.disconnectedCallback();
    }
}