import {ProviderBase} from "./provider-base.js";
import {AttrProvider} from "./attr-provider.js";

export class ForProvider extends ProviderBase {
    get ar() {
        return this._ar;
    }

    set ar(newValue) {
        if (this._ar != null) {
            crsbinding.events.removeOn(this._ar, "items-added", this._itemsAddedHandler);
            crsbinding.events.removeOn(this._ar, "items-deleted", this._itemsDeletedHandler);
        }

        this._ar = newValue;
        if (this._ar != null) {
            crsbinding.events.on(this._ar, "items-added", this._itemsAddedHandler);
            crsbinding.events.on(this._ar, "items-deleted", this._itemsDeletedHandler);
        }
    }

    constructor(element, context, property, value, ctxName) {
        super(element, context, property, value, ctxName);

    }

    init() {
        this._itemsAddedHandler = this._itemsAdded.bind(this);
        this._itemsDeletedHandler = this._itemsDeleted.bind(this);
    }

    dispose() {
        this.ar = null;

        crsbinding.expression.release(this._forExp);
        this._forExp = null;
        this._itemsAddedHandler = null;
        this._itemsDeletedHandler = null;

        this._singular = null;
        this._plural = null;
        this._container = null;
        this._collectionChangedHandler = null;

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

        const fn = pluralFactory(this._plural);
        const result = fn(this._context);
        if(result != null) {
            this._collectionChanged(null, result);
        }
    }

    async _collectionChanged(property, newValue) {
        if (Array.isArray(newValue)) {
            this.ar = newValue;
        }
        else {
            const fn = pluralFactory(this._plural);
            this.ar = fn(this._context);
        }

        if (this.ar != null) {
            await this._renderItems();
        }
        else {
            this._clear();
        }
    }

    _clear() {
        const elements = Array.from(this._container.children);

        for (let child of elements) {
            child.parentElement.removeChild(child);
            crsbinding.observation.releaseBinding(child);
        }
    }

    async _renderItems() {
        // release the old content
        await crsbinding.observation.releaseChildBinding(this._container);

        if (this.ar == null || this.ar.length == 0) return;

        // create document fragment
        const fragment = document.createDocumentFragment();

        // loop through items and add them to fragment after being parsed
        await this._forExp.function(this._context, (item) => {
            const element = this.createElement(item);
            fragment.appendChild(element);
        });

        this._container.innerHTML = "";
        this._container.appendChild(fragment);

        // render the updates. custom components are not ready at this time yet. so do it on the next frame.
        crsbinding.expression.updateUI(this.ar);

        // update the container's provider to this so that this can be freed when content changes
        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }
    }

    _itemsAdded(event, value, added) {
        for (let i = 0; i < added.items.length; i++) {
            const item = added.items[i];
            const index = added.indexes[i];

            const element = this.createElement(item);
            const update = element.children[0];
            const child = this._container.children[index];
            this._container.insertBefore(element, child);

            for (let p of update.__providers || []) {
                const provider = crsbinding.providerManager.items.get(p);
                if (provider instanceof AttrProvider) {
                    provider._change();
                }
            }

            crsbinding.expression.updateUI(item);
        }
    }

    _itemsDeleted(event, value, removed) {
        const elements = [];

        const push = (item) => {
            const uid = item.__uid;
            const result = this._container.querySelectorAll([`[data-uid="${uid}"]`]);
            result.forEach(element => elements.push(element));
        };

        if (Array.isArray(removed)) {
            for (let item of removed) {
                push(item)
            }
        }
        else {
            push(removed);
        }

        for (let element of elements) {
            if (element != null) {
                element.parentElement.removeChild(element);
                crsbinding.observation.releaseBinding(element);
            }
        }
    }

    createElement(item) {
        const element = this._element.content.cloneNode(true);
        crsbinding.parsers.parseElement(element, item, this._singular);

        for (let child of element.children) {
            child.dataset.uid = item.__uid;
        }

        return element;
    }

    _ensurePath() {
        const parts = this._plural.split(".");

    }
}

function pluralFactory(plural) {
    return new Function("context", `try { return context.${plural}; } catch {return null;}`);
}

const repeatCode = `for (_p of _c || []) {callback(_p);}`;