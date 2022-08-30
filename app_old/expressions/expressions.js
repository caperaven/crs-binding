import {ViewBase} from "../../src/view/view-base.js";

export default class Expressions extends ViewBase {
    async preLoad() {
        this.setProperty("model.siteCode", "A11");
        this.setProperty("model.code", "Code1");
    }
}
