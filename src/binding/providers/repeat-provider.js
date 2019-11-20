export class RepeatProvider {
    constructor(element, context) {
        this._element = element;
        this._context = context;

        this._eventHandler = this._collectionChanged.bind(this);
        this._itemsAddedHandler = this._itemsAdded.bind(this);
        this._itemsDeletedHandler = this._itemsDeleted.bind(this);

        crsbinding.providerManager.register(this);
        this.initialize().catch(error => console.error(error));
    }

    dispose() {
        delete this._element;
        delete this._context;

        crsbinding.expression.release(this._expObj);
        delete this._expObj;

        this._itemsAddedHandler = null;
        this._itemsDeletedHandler = null;
    }

    async initialize() {
        this._container = this._element.parentElement;
        this._container.removeChild(this._element);
        const exp = this._element.getAttribute("repeat");

        this._expObj = crsbinding.expression.compile(exp);

        // use listenOnPath on provider base.
        if (exp.indexOf(".") == -1) {
            crsbinding.events.listenOn(this._context, exp, this._eventHandler);
        }
        else {
            crsbinding.events.listenOnPath(this._context, exp, this._eventHandler);
        }

        await this._renderArray();
    }

    async _renderArray() {
        if (this.ar == null) return;
        const fragment = document.createDocumentFragment();

        for (let item of this.ar) {
            const element = this._element.content.cloneNode(true);
            await crsbinding.parsers.parseElement(element, item);
            fragment.appendChild(element);
        }

        this._container.innerHTML = "";
        this._container.appendChild(fragment);

        crsbinding.expression.updateUI(this.ar);
    }

    async _collectionChanged() {
        if (this.ar != null) {
            crsbinding.events.removeOn(this.ar, "items-added", this._itemsAddedHandler);
            crsbinding.events.removeOn(this.ar, "items-deleted", this._itemsDeletedHandler);
        }

        this.ar = this._expObj.function(this._context);

        if (this.ar == null) return;

        crsbinding.events.on(this.ar, "items-added", this._itemsAddedHandler);
        crsbinding.events.on(this.ar, "items-deleted", this._itemsDeletedHandler);

        this._renderArray();
    }

    async _itemsAdded() {
            await this._renderArray();
    }

    async _itemsDeleted() {
        await this._renderArray();
    }

    /**
     * 1. drawItems - once, one-way, two-way
     * 2. listenToArray - one-way, two-way
     * 3. observe-model - two-way
     *
     */

}