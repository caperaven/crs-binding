export class ProviderBase {
    get data() {
        return crsbinding.data.getValue(this._context);
    }

    constructor(element, context, property, value, ctxName, parentId) {
        this._globals = {};

        this._element = element;
        this._context = context;
        this._property = property;
        this._value = value;
        this._ctxName = ctxName || "context";
        this._eventsToRemove = [];
        this._isNamedContext = this._ctxName != "context";

        if (this._value && this._value.indexOf("$parent") != -1) {
            this._value = this._value.split("$parent.").join("");
            this._context = parentId;
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

        for (let key of Object.keys(this._globals)) {
            crsbinding.data.removeGlobalsCallback(key, this._globals[key]);
            delete this._globals[key];
        }
    }

    /**
     * Override to perform starting process
     */
    async initialize() {
    }

    listenOnPath(property, callback) {
        const collection = Array.isArray(property) == true ? property : [property];
        for (let p of collection) {
            if (p.indexOf("$globals.") != -1) {
                p = p.split("$globals.").join("");
                crsbinding.data.addCallback(crsbinding.$globals, p, callback);

                this._globals[p] = callback;
            }
            else {
                crsbinding.data.addCallback(this._context, p, callback);
            }
        }
    }
}