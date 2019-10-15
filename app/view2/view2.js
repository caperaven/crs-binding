import {ViewBase} from "./../../src/view/view-base.js";

export default class View extends ViewBase {
    connectedCallback() {
        super.connectedCallback();
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    _loaded() {
        super._loaded();
        this.field1 = "Field1";
    }
}
