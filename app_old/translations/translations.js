import {ViewBase} from "../../src/view/view-base.js";
import "./component.js";

export default class Translations extends crsbinding.classes.ViewBase {
    preLoad() {
        this.setProperty("ctx", this._dataId);
    }
}