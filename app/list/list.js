import {ViewBase} from "../../src/view/view-base.js";
import {getData} from "./data.js";

export default class List extends ViewBase {
    get list() {
        if (this._list == null) {
            this._list = this._element.querySelector("ul");
        }
        return this._list;
    }

    async disconnectedCallback() {
        crsbinding.inflationManager.unregister("list");
        this._list = null;
        super.disconnectedCallback();
    }

    preLoad() {
        this.setProperty("items", getData(1000));
    }

    load() {
        const template = document.querySelector("#tplItem");
        crsbinding.inflationManager.register("list", template, "context", true);
        this.pageNumber = 0;
        this.pageSize = 10;

        this.nextPage();
        super.load();
    }

    return() {
        const elements = Array.from(this.list.children);
        for (let element of elements) {
            element.parentElement.removeChild(element);
        }

        crsbinding.inflationManager.returnElements("list", elements);
    }

    nextPage() {
        const startIndex = this.pageNumber * this.pageSize;
        const endIndex = startIndex + this.pageSize;

        const data = this.getProperty("items").slice(startIndex, endIndex);
        const fragment = crsbinding.inflationManager.get("list", data);
        this.list.appendChild(fragment);

        this.pageNumber += 1;
    }

}