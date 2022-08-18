import {ViewBase} from "../../src/view/view-base.js";

export default class Case extends ViewBase {
    preLoad() {
        this.setProperty("age", 20);
    }
}