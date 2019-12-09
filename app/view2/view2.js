import {ViewBase} from "./../../src/view/view-base.js";

export default class View extends ViewBase {
    static get properties() {
        return ["property1"];
    }

    connectedCallback() {
        super.connectedCallback();
        crsbinding.expression.updateUI(this);
    }

    disconnectedCallback() {
        super.disconnectedCallback();
    }

    _loaded() {
        super._loaded();
        this.field1 = "Field1";
    }
}
