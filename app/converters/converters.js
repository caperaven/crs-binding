import {ViewBase} from "./../../src/view/view-base.js";

export default class Converters extends ViewBase {
    get status() {
        return this.getProperty("status");
    }

    set status(newValue) {
        this.setProperty("status", newValue);
    }

    async connectedCallback() {
        super.connectedCallback();

        crsbinding.valueConverters.register("status", StatusConverter);

        this.status = 1;
        this.title = "Converters";
    }

    async disconnectedCallback() {
        crsbinding.valueConverters.unregister("status");
        super.disconnectedCallback();
    }
}

class StatusConverter {
    static convertTo(value) {
        return `Option ${value}`;
    }

    static convertBack(value) {
        if (Number.isNaN(value)) {
            if (value == null) return 1;
            const parts = value.split(" ");
            return Number.parseInt(parts[1]);
        }
        else return value;
    }
}