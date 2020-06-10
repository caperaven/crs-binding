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

    async connectedCallback() {
        super.connectedCallback();
        this.customEventHandler = this.customEvent.bind(this);
        crsbinding.events.emitter.on("customEvent", this.customEventHandler);
    }

    async disconnectedCallback() {
        crsbinding.events.emitter.on("customEvent", this.customEventHandler);
        this.customEventHandler = null;
        super.disconnectedCallback();
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

    customEvent(args) {
        console.log(args);
    }
}