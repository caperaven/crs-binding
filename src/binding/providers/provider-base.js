export class ProviderBase {
    constructor(element, context, property, value, ctxName) {
        this._element = element;
        this._context = context;
        this._property = property;
        this._value = value;
        this._ctxName = ctxName || "context";
        this._eventsToRemove = [];
        this._isNamedContext = this._ctxName != "context";

        crsbinding.providerManager.register(this);
        this.initialize();
    }

    dispose() {
        this._eventsToRemove.forEach(event => {
            crsbinding.events.removeOn(this._context, event.value, event.callback);
        });

        this._eventsToRemove.length = 0;
        this._eventsToRemove = null;

        this._element = null;
        this._context = null;
        this._property = null;
        this._value = null;
        this._ctxName = null;
    }

    /**
     * Override to perform starting process
     */
    initialize() {
    }

    listenOnPath(value, callback) {
        if (Array.isArray(value) == true) {
            for (let v of value) {
                this.listenOnPath(v, callback);
            }
            return;
        }

        if (this._isNamedContext) {
            value = value.replace(`${this._ctxName}.`, "");
        }

        if (value.indexOf(".") == -1) {
            crsbinding.events.listenOn(this._context, value, callback);
        }
        else {
            crsbinding.events.listenOnPath(this._context, value, callback);
        }

        this._eventsToRemove.push({
            value: value,
            callback: callback
        })
    }
}