import {ViewBase} from "../../src/view/view-base.js";

export default class HtmlFragments extends ViewBase {
    get html() {
        return import.meta.url;
    }

    load() {
        this.setProperty("line1", "Line 1");
        this.setProperty("line2", "Line 2");
        this.setProperty("line3", "Line 3");

        super.load();
    }
}