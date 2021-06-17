import {ViewBase} from "../../src/view/view-base.js";
import "./master-component.js";
import "./child-component.js";

export default class Component extends ViewBase {
    async preLoad() {
        const items = [];
        for (let i = 0; i < 20; i++) {
            items.push({value: i});
        }
        this.setProperty("items", items);
    }
}