import {ProviderBase} from "./provider-base.js";

export class ForProvider extends ProviderBase {
    constructor(element, context, property, value) {
        super(element, context, property, value);
    }

    dispose() {
        crsbinding.expression.release(this._forExp);
        this._forExp = null;

        super.dispose();
        this._renderItemsHandler = null;
    }

    async initialize() {
        // 1. get the container and remove the template
        this._container = this._element.parentElement;
        this._container.removeChild(this._element);

        // 2. get the properties to work with and build the for loop
        const parts = this._value.split("of");

        const forExp = repeatCode
            .split("__property__").join(parts[0].trim())
            .split("__collection__").join(parts[1].trim());

        this._forExp = crsbinding.expression.compile(forExp, ["callback"], {sanitize: false, async: true});

        // 3. listen to the collection property on the context changing
        this._renderItemsHandler = this._renderItems.bind(this);
        this.listenOnPath(parts[1], this._renderItemsHandler);
    }

    async _renderItems() {
        const fragment = document.createDocumentFragment();

        await this._forExp.function(this._context, async (item) => {
            const element = this._element.content.cloneNode(true);
            await crsbinding.parsers.parseElement(element, item);
            fragment.appendChild(element);
        });

        this._container.innerHTML = "";
        this._container.appendChild(fragment);
    }
}

const repeatCode = `for (__property__ of context.__collection__) {await callback(__property__);}`;