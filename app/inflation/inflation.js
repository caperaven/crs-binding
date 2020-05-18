import {ViewBase} from "../../src/view/view-base.js";
import {getRenderData} from "./data.js";

export default class Component extends ViewBase {
    get container() {
        if (this._container == null) {
            this._container = this._element.querySelector("#container");
        }
        return this._container;
    }

    set container(newValue) {
        this._container = newValue;
    }

    async connectedCallback() {
        super.connectedCallback();

        const template = this._element.querySelector("#items-template");
        crsbinding.inflationManager.register("items", template);

        const data = getRenderData();
        const fragment = crsbinding.inflationManager.get("items", data);
        this.container.appendChild(fragment);
    }

    async disconnectedCallback() {
        this.container = null;
        crsbinding.inflationManager.unregister("items");
        super.disconnectedCallback();
    }
}