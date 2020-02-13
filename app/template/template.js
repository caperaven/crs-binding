import {ViewBase} from "./../../src/view/view-base.js";

export default class TemplatesView extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
        const template = this._element.querySelector("#my-template");
        crsbinding.inflationManager.register("list-item", template);
        this.list = this._element.querySelector(".my-list");

        const data = getData(10);
        const fragment = crsbinding.inflationManager.get("list-item", data);
        this.list.appendChild(fragment);
    }

    async disconnectedCallback() {
        crsbinding.inflationManager.unregister("list-item");
        super.disconnectedCallback();
    }
}

function getData(count) {
    const result = [];

    let isActive = true;

    for (let i = 0; i < count; i++) {
        result.push({
            id: i,
            caption: `Item ${i}`,
            isActive: isActive
        });

        isActive = !isActive;
    }

    return result;
}