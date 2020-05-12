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

    get parts() {
        return this.getProperty("parts");
    }

    set parts(newValue) {
        this.setProperty("parts", newValue);

        console.log(crsbinding.data.getValue(this._dataId, "parts"));
    }

    _loaded() {
        crsbinding.data.makeShared(this._dataId, "data", ["firstName", "contacts.phone.land", "contacts.phone.cell", "contacts.phone.fax"]);

        this.data = {
            firstName: "John",
            lastName: "Doe",
            age: 20,
            contacts: {
                phone: {
                    land: "Land number",
                    cell: "cell number",
                    fax: "fax number"
                }
            }
        };

        this.parts = [];

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

    newObject2() {
        this.data = {
            firstName: "John",
            lastName: "Doe",
            age: 20,
            contacts: {
                phone: {
                    land: "Land number",
                    cell: "cell number",
                    fax: "fax number"
                }
            }
        };
    }
}