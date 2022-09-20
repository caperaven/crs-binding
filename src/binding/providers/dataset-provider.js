import {ProviderBase} from "./provider-base.js";

export class DatasetProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId, false);
    }

    dispose() {
        this.clear();

        this._element.removeEventListener("change", this._changeHandler);
        this._changeHandler = null;
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
        this._element.addEventListener("change", this._changeHandler);
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

    _change(event) {
        const field = event.target.dataset.field;
        if (field == null) return;

        const type = event.target.type || "text";
        const oldValue = crsbinding.data.getValue(this._context, field);

        crsbinding.data._setContextProperty(this._context, field, event.target.value, {oldValue: oldValue, ctxName: this._ctxName, dataType: type == "text" ? "string" : type});
        event.stopPropagation();
    }

    async _initFields(element) {
        this.inputs = this.inputs || {}
        const inputs = element.querySelectorAll("[data-field]");

        for (const input of inputs) {
            this.inputs[input.dataset.field] = input;
            this.listenOnPath(input.dataset.field, this._eventHandler);
            await crsbinding.data.updateUI(this._context, input.dataset.field);
        }
    }

    propertyChanged(prop, value) {
        const element = this.inputs[prop];
        if (element != null && element.value != value) {
            element.value = value == null ? "" : value;
        }
    }

    clear() {
        const keys = Object.keys(this.inputs);
        for (const key of keys) {
            this.removeCallback(key);
            this.inputs[key] = null;
        }
        this.inputs = null;
    }

    removeCallback(path) {
        crsbinding.data.removeCallback(this._context, path, this._eventHandler);
        delete this.inputs[path];

        const cleanEvent = this._cleanEvents.filter(item => item.path == path);
        if (cleanEvent != null) {
            const index = this._cleanEvents.indexOf(cleanEvent);
            delete cleanEvent.callback;
            this._cleanEvents.splice(index, 1);
        }
    }
}