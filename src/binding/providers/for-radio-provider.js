import {ProviderBase} from "./provider-base.js";

export class ForRadioProvider extends ProviderBase {
    dispose() {
        for (let input of this.inputs) {
            input.removeEventListener("change", this._changeHandler);
        }

        this.inputs = null;
        this._changeHandler = null;
        this._propertyToSet = null;

        super.dispose();
    }

    async initialize() {
        this._propertyToSet = this._element.getAttribute("property");
        this._changeHandler = this._change.bind(this);

        const parts = this._value.split("of");
        const singular = parts[0].trim();
        const plural = parts[1].trim();

        const key = `for-group-${singular}`;

        await crsbinding.inflationManager.register(key, this._element, singular);

        const data = crsbinding.data.getValue(this._context, plural);
        const elements = crsbinding.inflationManager.get(key, data);
        crsbinding.inflationManager.unregister(key);

        const currentSelectedValue = crsbinding.data.getProperty(this._context, this._propertyToSet);

        this.inputs = elements.querySelectorAll("input");
        for (let input of this.inputs) {
            input.setAttribute("type", "radio");
            input.setAttribute("name", plural);
            input.addEventListener("change", this._changeHandler);

            if (currentSelectedValue && input.getAttribute("value") == currentSelectedValue.toString()) {
                input.setAttribute("checked", "checked");
            }
        }

        this._element.parentElement.appendChild(elements);
        this._element.parentElement.removeChild(this._element);

    }

    async _change(event) {
        crsbinding.data.setProperty(this._context,this._propertyToSet, event.target.value);
    }
}