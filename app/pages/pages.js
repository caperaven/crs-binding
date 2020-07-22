import {ViewBase} from "../../src/view/view-base.js";
import "./component/pages.js";

export default class Pages extends ViewBase {
    preLoad() {
        this.setProperty("dataId", this._dataId);
    }
}