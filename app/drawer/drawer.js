import {ViewBase} from "../../src/view/view-base.js";

export default class Drawer extends ViewBase {
    preLoad() {
        crsbinding.data.setProperty(crsbinding.$globals, "menu.isVisible", false, null, "boolean");
    }
}