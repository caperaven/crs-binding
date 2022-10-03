export default class ValueConversion extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    async disconnectedCallback() {
        crsbinding.valueConvertersManager.remove("ascii");
        await crsbinding.inflationManager.unregister("display");
        await super.disconnectedCallback();
    }

    preLoad() {
        crsbinding.valueConvertersManager.add("ascii", asciiConverter);
        this.setProperty("char", 65);
    }

    load() {
        const template = this._element.querySelector("template");
        crsbinding.inflationManager.register("display", template);
        super.load();
    }

    async charChanged(newValue) {
        const element = this._element.querySelector("#display");
        const fragment = crsbinding.inflationManager.get("display", { char: newValue }, element);

        if (fragment != null) {
            this._element.appendChild(fragment)
        }
    }
}

const asciiConverter = {
    set (value) {
        return value.charCodeAt(0);
    },

    get (value) {
        if (isNaN(value)) {
            return value;
        }

        return String.fromCharCode(value);
    }
}