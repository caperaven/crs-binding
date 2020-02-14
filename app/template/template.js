import {ViewBase} from "./../../src/view/view-base.js";

export default class TemplatesView extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
        const template = this._element.querySelector("#my-template");
        crsbinding.inflationManager.register("list-item", template);
        this.list = this._element.querySelector(".my-list");

        this.data = getData(10);
        const fragment = crsbinding.inflationManager.get("list-item", this.data);
        this.list.appendChild(fragment);
    }

    async disconnectedCallback() {
        crsbinding.inflationManager.unregister("list-item");
        super.disconnectedCallback();
    }

    deflate() {
        const element = this.list.children[0];
        crsbinding.inflationManager.deflate("list-item", element);
    }

    inflate() {
        const element = this.list.children[0];
        crsbinding.inflationManager.inflate("list-item", element, this.data[0]);
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