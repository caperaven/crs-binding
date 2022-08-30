import {ViewBase} from "../../src/view/view-base.js";
import {data} from "./data.js";

export default class NextedFor extends ViewBase {
    preLoad() {
        this.setProperty("data", data)
    }

    load() {
        crsb.data.updateUI(this, "data");
        super.load();
    }
}