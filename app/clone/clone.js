import {ViewBase} from "./../../src/view/view-base.js";

export default class Clone extends ViewBase {
    async connectedCallback() {
        super.connectedCallback();
        this.model.caption = "Hello World";
        this.model.isClone = false;
        this.model.site = { code: "A11" }
    }

    async disconnectedCallback() {
        super.disconnectedCallback();
        this.model = null;
        this.model2 = null;
    }

    clone() {
        this.model2 = crsbinding.utils.clone(this.model, this.model2);
        this.model2.isClone = true;
        this.model2.site.code = "B11";
    }
}