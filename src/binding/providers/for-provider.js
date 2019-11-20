import {ProviderBase} from "./provider-base.js";

export class ForProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName) {
        super(element, context, property, value, ctxName);
    }

    dispose() {
        crsbinding.expression.release(this._forExp);
        this._forExp = null;
        delete this.ar;
        delete this._singular;
        delete this._plural;

        super.dispose();
        this._renderItemsHandler = null;
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
            .split("_c").join(this._plural);

        this._forExp = crsbinding.expression.compile(forExp, ["callback"], {sanitize: false, async: true, ctxName: this._ctxName});

        // 3. listen to the collection property on the context changing
        this._collectionChangedHandler = this._collectionChanged.bind(this);
        this.listenOnPath(parts[1], this._collectionChangedHandler);
    }

    async _collectionChanged(property, newValue, oldValue) {
        this.ar = newValue;
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
}

const repeatCode = `for (_p of context._c || []) {await callback(_p);}`;