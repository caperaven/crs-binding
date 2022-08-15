import {ProviderBase} from "./provider-base.js";

export class DatasetProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId, false);
        this._observeChanges();
    }

    dispose() {
        this.clear();

        if (this._observer != null) {
            this._observer.disconnect();
            this._mutationHandler = null;
            this._observer = null;
        }

        this._element.removeEventListener("change", this._changeHandler);
        this._changeHandler = null;
        this._eventHandler = null;

        super.dispose();
    }

    async initialize() {
        this._changeHandler = this._change.bind(this);
        this._element.addEventListener("change", this._changeHandler);
        this._eventHandler = this.propertyChanged.bind(this);

        await this._initFields(this._element);
    }

    _observeChanges() {
        if (this._element.dataset.update == "true") {
            const config = { attributes: false, childList: true, subtree: true, characterData: false };
            this._mutationHandler = this.mutated.bind(this);
            this._observer = new MutationObserver(this._mutationHandler);
            this._observer.observe(this._element, config);
        }
    }

    _change(event) {
        const field = event.target.dataset.field;
        if (field == null) return;

        const type = event.target.type || "text";
        const oldValue = crsbinding.data.getValue(this._context, field);

        crsbinding.data._setContextProperty(this._context, field, event.target.value, {oldValue: oldValue, ctxName: this._ctxName, dataType: type == "text" ? "string" : type});
        event.stopPropagation();
    }

    async _initFields(element, update = false) {
        this.inputs = this.inputs || {}
        const inputs = element.querySelectorAll("input[data-field]");

        for (const input of inputs) {
            this.inputs[input.dataset.field] = input;
            this.listenOnPath(input.dataset.field, this._eventHandler);

            if (update == true) {
                await crsbinding.data.updateUI(this._context, input.dataset.field);
            }
        }
    }

    async mutated(mutationList, observer) {
        for (const mutation of mutationList) {
            if (mutation.addedNodes.length > 0) {
                for (let element of mutation.addedNodes) {
                    if (element.dataset == null) continue;

                    await crsbinding.parsers.parseElement(element, this._context);
                    await this._initFields(element, true);
                }
            }

            if (mutation.removedNodes.length > 0) {
                for (let element of mutation.removedNodes) {
                    if (element.dataset == null) continue;

                    if (element.dataset.field != null) {
                        this.removeCallback(element.dataset.field);
                    }
                    else {
                        const elements = element.querySelectorAll("input[data-field]");
                        for (element of elements) {
                            this.removeCallback(element.dataset.field);
                        }
                    }
                }
            }
        }
    }

    propertyChanged(prop, value) {
        const element = this.inputs[prop];
        if (element != null && element.value != value) {
            element.value = value;
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