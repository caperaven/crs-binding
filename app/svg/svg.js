import {ViewBase} from "../../src/view/view-base.js";

export default class Svg extends ViewBase {
    get name() {
        return this.getProperty("name");
    }

    set name(newValue) {
        this.setProperty("name", newValue);
    }

    async preLoad(setProperty) {
        return new Promise(resolve => {
            setProperty("rect1Title", "Rect 1");
            setProperty("rect2Title", "Rect 2");
            setProperty("rect3Title", "Rect 3");
            setProperty("shape", '<rectangle x="10" y="10" width="50" height="50" fill="red">');
            resolve();
        })
    }
}