export class ProviderBase {
    get data() {
        return crsbinding.data.getValue(this._context);
    }

    constructor(element, context, property, value, ctxName, parentId, changeParentToContext = true) {
        this._cleanEvents = [];
        this._element = element;
        this._context = context;
        this._property = property;
        this._value = value;
        this._ctxName = ctxName || "context";
        this._eventsToRemove = [];
        this._isNamedContext = this._ctxName != "context";
        this._parentId = parentId;

        if (this._value && this._value.indexOf("$parent") != -1 && changeParentToContext == true) {
            this._value = this._value.split("$parent.").join("");
            this._context = parentId;
        }

        if (this._value && this._value.indexOf("$self") != -1) {
            this._value = this._value.split("$self.").join("");
            this._context = this._element._dataId;
        }

        this.init && this.init();

        crsbinding.providerManager.register(this);
        this.initialize().catch(error => {
            throw error;
        });

        if (this._element.nodeName.indexOf("-") != -1 && this._property == this._ctxName) {
            this._element[this._property] = this._context;
        }
    }

    dispose() {
        this._eventsToRemove.length = 0;
        this._eventsToRemove = null;

        this._element = null;
        this._context = null;
        this._property = null;
        this._value = null;
        this._ctxName = null;
        crsbinding.events.removeOnPath(this._cleanEvents);
        this._cleanEvents = null;
    }

    /**
     * Override to perform starting process
     */
    async initialize() {
    }

    listenOnPath(property, callback) {
        const collection = Array.isArray(property) == true ? property : [property];

        for (let p of collection) {
            const events = crsbinding.events.listenOnPath(this._context, p, callback);
            this._cleanEvents = [...this._cleanEvents, ...events];
        }

        // removeOnPath
    }
}