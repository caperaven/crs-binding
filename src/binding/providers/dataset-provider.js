import {ProviderBase} from "./provider-base.js";
import {getConverterParts} from "../../lib/converter-parts.js";

export class DatasetProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId, false);
    }

    dispose() {
        this.clear();

        this._element.removeEventListener("change", this._changeHandler);
        this._element.removeEventListener("click", this._clickHandler);

        this._changeHandler = null;
        this._clickHandler = null;
        this._eventHandler = null;

        if (this._perspectiveElement != null) {
            this._perspectiveElement.removeEventListener("view-loaded", this.viewLoadedHandler);
            this.viewLoadedHandler = null
            this._perspectiveElement = null;
        }

        super.dispose();
    }

    async initialize() {
        this._changeHandler = this._change.bind(this);
        this._clickHandler = this._click.bind(this);

        this._element.addEventListener("change", this._changeHandler);
        this._element.addEventListener("click", this._clickHandler);

        this._eventHandler = this.propertyChanged.bind(this);

        this._perspectiveElement = this._element.querySelector("perspective-element");
        if (this._perspectiveElement != null) {
            this.viewLoadedHandler = this.viewLoaded.bind(this);
            this._perspectiveElement.addEventListener("view-loaded", this.viewLoadedHandler);
        }

        await this._initFields(this._perspectiveElement || this._element);
    }

    async viewLoaded() {
        this.clear();
        await this._initFields(this._perspectiveElement);
    }

    async _change(event) {
        let field = event.target.dataset.field;
        if (field == null) return;

        let value = event.target.value;

        if (event.target._converter != null) {
            field = event.target._converter.path;
            const converter = crsbinding.valueConvertersManager.get(event.target._converter.converter);
            value = converter.set(value, event.target._converter.parameter);
        }

        const type = event.target.type || "text";
        const oldValue = crsbinding.data.getValue(this._context, field);

        crsbinding.data._setContextProperty(this._context, field, value, {oldValue: oldValue, ctxName: this._ctxName, dataType: type == "text" ? "string" : type});
        event.stopPropagation();
    }

    async _click(event) {
        if (event.target.dataset.action != null) {
            const context = crsbinding.data.getContext(this._context);
            await context[event.target.dataset.action]?.(event);
        }
    }

    async _initFields(element) {
        this.inputs = this.inputs || {}
        const inputs = element.querySelectorAll("[data-field]");

        for (const input of inputs) {
            let field = input.dataset.field;

            if (input.dataset.field.indexOf(":") != -1) {
                input._converter = getConverterParts(input.dataset.field);
                field = input._converter.path;

                let paramCode = "null";
                if (input._converter.parameter != null) {
                    paramCode = `JSON.parse('${JSON.stringify(input._converter.parameter)}')`;
                }

                const code = `return crsbinding.valueConvertersManager.convert(value, "${input._converter.converter}", "get", ${paramCode})${input._converter.postExp}`;
                input._converter.fn = new Function("value", code);
            }

            this.inputs[field] = input;

            this.listenOnPath(field, this._eventHandler);
            await crsbinding.data.updateUI(this._context, field);
        }
    }

    propertyChanged(prop, value) {
        const element = this.inputs[prop];
        if (element != null && element.value != value) {

            if (element._converter != null) {
                value = element._converter.fn(value);
            }

            element.value = value == null ? "" : value;
        }
    }

    clear() {
        const keys = Object.keys(this.inputs);
        for (const key of keys) {
            this.removeCallback(key);
        }
        this.inputs = null;
    }

    removeCallback(path) {
        crsbinding.data.removeCallback(this._context, path, this._eventHandler);

        this.inputs[path]._converter.fn = null;
        this.inputs[path]._converter = null;

        delete this.inputs[path];

        const cleanEvent = this._cleanEvents.filter(item => item.path == path);
        if (cleanEvent != null) {
            const index = this._cleanEvents.indexOf(cleanEvent);
            delete cleanEvent.callback;
            this._cleanEvents.splice(index, 1);
        }
    }
}