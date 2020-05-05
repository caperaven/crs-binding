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
        crsbinding.data.makeShared(this._dataId, "data", ["firstName"]);

        this.data = {
            firstName: "John",
            lastName: "Doe",
            age: 20
        };

        super._loaded();
    }

    update() {
        crsbinding.data.updateUI(0, "data.firstName");
        crsbinding.data.updateUI(1, "value");
        crsbinding.data.updateUI(2, "data.firstName");
    }

    newObject() {
        this.data = {
            firstName: "Test",
            lastName: "Data",
            age: 30
        };
    }
}