import {ViewBase} from "./../../src/view/view-base.js";

export default class Svg extends ViewBase {
    async connectedCallback() {
        this.title = "SVG Test";
        this.isActive = true;
        super.connectedCallback();
    }
}