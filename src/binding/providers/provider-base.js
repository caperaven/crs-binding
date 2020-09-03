export class ProviderBase {
    get data() {
        return crsbinding.data.getValue(this._context);
    }

    constructor(element, context, property, value, ctxName, parentId, changeParentToContext = true) {
        this._cleanEvents = [];
        this._globals = {};

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

        this._cleanEvents.forEach(item => {
            crsbinding.data.removeCallback(item.context, item.path, item.callback);
            delete item.context;
            delete item.path;
            delete item.callback;
        });

        this._cleanEvents = null;

        for (let key of Object.keys(this._globals)) {
            crsbinding.data.removeCallback(crsbinding.$globals, key, this._globals[key]);
            delete this._globals[key];
        }
        this._globals = null;
    }

    /**
     * Override to perform starting process
     */
    async initialize() {
    }

    listenOnPath(property, callback) {
        const collection = Array.isArray(property) == true ? property : [property];

        for (let p of collection) {
            let context = this._context;

            if (p.indexOf("$globals.") != -1) {
                context = crsbinding.$globals;
                p = p.split("$globals.").join("");
                this._globals[p] = callback;
            }

            this._addCallback(context, p, callback);
        }
    }

    _addCallback(context, path, callback) {
        crsbinding.data.addCallback(context, path, callback);
        this._cleanEvents.push({
            context: context,
            path: path.split("$parent.").join("").split("$context.").join(""),
            callback: callback
        });
    }
}