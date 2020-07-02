import {ViewBase} from "../../src/view/view-base.js";

export default class Svg extends ViewBase {
    async connectedCallback() {
        super.connectedCallback();
    }

    async preLoad(setProperty) {
        setProperty("rect1Title", "Rect 1");
        setProperty("rect2Title", "Rect 2");
        setProperty("rect3Title", "Rect 3");
    }
}