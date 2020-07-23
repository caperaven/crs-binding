import {ViewBase} from "../../src/view/view-base.js";
import "./component/pages.js";

export default class Pages extends ViewBase {
    preLoad() {
        this.setProperty("dataId", this._dataId);
        this.setProperty("data", {
            p1: "Paragraph 1",
            p2: "Paragraph 2",
            p3: "Paragraph 3"
        })
    }
}