import {ViewBase} from "../../src/view/view-base.js";

export default class Welcome extends ViewBase {
    fn1(...args) {
        console.log(args);
    }

    preLoad() {
        this.setProperty("item", {
            name: "Johan"
        })
    }

    debug() {
        console.log(this.getProperty("item.name"));
    }
}