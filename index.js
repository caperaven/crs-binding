import {ViewBase} from "./src/view/view-base.js";

export default class Index extends ViewBase {
    async connectedCallback() {
        this.title = "View Base Example";
        super.connectedCallback();
    }
}