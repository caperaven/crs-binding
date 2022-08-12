import {ProviderBase} from "./provider-base.js";

export class DatasetProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId, false);
    }

    dispose() {
        this._element.removeEventListener("change", this._changeHandler);
        this._changeHandler = null;

        this._eventHandler = null;

        const keys = Object.keys(this.inputs);
        for (const key of keys) {
            this.inputs[key] = null;
        }
        this.inputs = null;

        super.dispose();
    }

    async initialize() {
        this._changeHandler = this._change.bind(this);
        this._element.addEventListener("change", this._changeHandler);
        this._eventHandler = this.propertyChanged.bind(this);

        await this._initFields();
    }

    _change(event) {
        const field = event.target.dataset.field;
        if (field == null) return;

        const type = event.target.type || "text";
        const oldValue = crsbinding.data.getValue(this._context, field);

        crsbinding.data._setContextProperty(this._context, field, event.target.value, {oldValue: oldValue, ctxName: this._ctxName, dataType: type == "text" ? "string" : type});
        event.stopPropagation();
    }

    async _initFields() {
        this.inputs = {}
        const inputs = this._element.querySelectorAll("input[data-field]");
        for (const input of inputs) {
            this.inputs[input.dataset.field] = input;
            this.listenOnPath(input.dataset.field, this._eventHandler);
        }
        console.log(this.inputs);
    }

    propertyChanged(prop, value) {
        const element = this.inputs[prop];
        if (element != null && element.value != value) {
            element.value = value;
        }
    }
}