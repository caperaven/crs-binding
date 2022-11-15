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

    async load() {
        const template = this._element.querySelector("template");
        await crsbinding.inflationManager.register("display", template);
        super.load();
    }

    async charChanged(newValue) {
        const element = this._element.querySelector("#display");
        const elements = element == null ? null : [element];
        const fragment = crsbinding.inflationManager.get("display", [{ char: newValue }], elements);

        if (fragment != null) {
            this._element.appendChild(fragment)
        }
    }
}

const asciiConverter = {
    set (value, args) {
        if (args) {
            console.log(args);
        }

        return value.charCodeAt(0);
    },

    get (value, args) {
        if (isNaN(value)) {
            return value;
        }

        let result = String.fromCharCode(value);

        if (args?.case == "upper") {
            result = result.toUpperCase();
        }

        if (args?.case == "lower") {
            result = result.toLowerCase();
        }

        return result;
    }
}