import {ProviderBase} from "./provider-base.js";

export class ForProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName) {
        super(element, context, property, value, ctxName);
        this._itemsAddedHandler = this._itemsAdded.bind(this);
        this._itemsDeletedHandler = this._itemsDeleted.bind(this);
    }

    dispose() {
        crsbinding.expression.release(this._forExp);
        this._forExp = null;
        this._itemsAddedHandler = null;
        this._itemsDeletedHandler = null;

        delete this.ar;
        delete this._singular;
        delete this._plural;

        super.dispose();
    }

    async initialize() {
        // 1. get the container and remove the template
        this._container = this._element.parentElement;
        this._container.removeChild(this._element);

        // 2. get the properties to work with and build the for loop
        const parts = this._value.split("of");
        this._singular = parts[0].trim();
        this._plural = parts[1].trim();

        const forExp = repeatCode
            .split("_p").join(this._singular)
            .split("_c").join(this._ctxName == "context" ? `context.${this._plural}` : this._plural);

        this._forExp = crsbinding.expression.compile(forExp, ["callback"], {sanitize: false, async: true, ctxName: this._ctxName});

        // 3. listen to the collection property on the context changing
        this._collectionChangedHandler = this._collectionChanged.bind(this);

        this.listenOnPath(this._plural, this._collectionChangedHandler);
    }

    async _collectionChanged(property, newValue) {
        if (this.ar != null) {
            crsbinding.events.removeOn(this.ar, "items-added", this._itemsAddedHandler);
            crsbinding.events.removeOn(this.ar, "items-deleted", this._itemsDeletedHandler);
        }

        this.ar = newValue;
        crsbinding.events.on(this.ar, "items-added", this._itemsAddedHandler);
        crsbinding.events.on(this.ar, "items-deleted", this._itemsDeletedHandler);

        await this._renderItems();
    }

    async _renderItems() {
        const fragment = document.createDocumentFragment();

        await this._forExp.function(this._context, async (item) => {
            const element = this._element.content.cloneNode(true);
            await crsbinding.parsers.parseElement(element, item, this._singular);
            fragment.appendChild(element);
        });

        this._container.innerHTML = "";
        this._container.appendChild(fragment);

        crsbinding.expression.updateUI(this.ar);
    }

    async _itemsAdded() {
        await this._renderItems();
    }

    async _itemsDeleted() {
        await this._renderItems();
    }
}

const repeatCode = `for (_p of _c || []) {await callback(_p);}`;