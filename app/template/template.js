import {ViewBase} from "./../../src/view/view-base.js";

export default class TemplatesView extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
        const template = this._element.querySelector("#my-template");
        crsbinding.inflationManager.register("list-item", template);
        this.list = this._element.querySelector(".my-list");
    }

    async disconnectedCallback() {
        crsbinding.inflationManager.unregister("list-item");
        super.disconnectedCallback();
    }
}