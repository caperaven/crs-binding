import {ViewBase} from "../../src/view/view-base.js";

export default class Welcome extends ViewBase {
    fn1(...args) {
        console.log(args);
    }

    propertyChanged(property, value) {
        console.log("property changed: ", property, value);
    }
}