import {ViewBase} from "./../../src/view/view-base.js";

/**
 * JHR: Add for.once example after you added it.
 * 
 * 1. Add class expression
 * 2. Add attribute.if expressions x 3
 * 3. Add for.once
 * 4. Write tests
 * 5. Go sleep.
 */

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
        crsbinding.inflationManager.deflate("list-item", this.list.children[0]);
        crsbinding.inflationManager.deflate("list-item", this.list.children[1]);
        crsbinding.inflationManager.deflate("list-item", this.list.children[2]);
        crsbinding.inflationManager.deflate("list-item", this.list.children[3]);
    }

    inflate() {
        crsbinding.inflationManager.inflate("list-item", this.list.children[0], this.data[0]);
        crsbinding.inflationManager.inflate("list-item", this.list.children[1], this.data[1]);
        crsbinding.inflationManager.inflate("list-item", this.list.children[2], this.data[2]);
        crsbinding.inflationManager.inflate("list-item", this.list.children[3], this.data[3]);
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
    
    result[0].isReady = true;
    result[1].isReady = true;
    result[2].isReady = true;

    return result;
}