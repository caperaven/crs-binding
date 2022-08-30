import {ViewBase} from "../../src/view/view-base.js";

export default class FormBinding extends ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        window.addEventListener('popstate', function () {
            debugger;
        });
    }

    preLoad() {
        this.setProperty("context", this._dataId);
        this.setProperty("currentView", "person-view");

        crsbinding.translations.add({
            firstName: "First Name",
            lastName: "Last Name",
            age: "Age",
            young: "Young Guns",
            adults: "Wise People",
            old: "Oldies",
            older: "Rusted",
            dead: "Basically Dead"
        }, "screen")
    }

    async disconnectedCallback() {
        crsbinding.translations.remove("screen");
        await super.disconnectedCallback();
    }

    async changeValues() {
        this.setProperty("firstName", "Peter");
        this.setProperty("lastName", "Parker");
        this.setProperty("age", 30);
    }
}