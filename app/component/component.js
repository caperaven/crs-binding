import {ViewBase} from "../../src/view/view-base.js";
import "./input-form.js";
import "./firstName.js";

export default class Component extends ViewBase {
    get data() {
        return this.getProperty("data");
    }

    set data(newValue) {
        this.setProperty("data", newValue);
    }

    _loaded() {
        this.data = {
            firstName: "John",
            lastName: "Doe",
            age: 20
        };

        super._loaded();
    }
}