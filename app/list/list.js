import {ViewBase} from "../../src/view/view-base.js";

export default class List extends ViewBase {
    load() {
        const template = document.querySelector("tplItem");
        crsbinding.elementStoreManager.register("list", true, true);
    }
}