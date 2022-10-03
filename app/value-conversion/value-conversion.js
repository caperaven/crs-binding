export default class ValueConversion extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        crsbinding.valueConvertersManager.add("ascii", asciiConverter);

        const result = crsbinding.valueConvertersManager.convert(65, "ascii", "get");
        console.log(result);

        this.setProperty("char", 65);
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