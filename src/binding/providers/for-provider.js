import {ProviderBase} from "./provider-base.js";
import {AttrProvider} from "./attr-provider.js";

export class ForProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName) {
        super(element, context, property, value, ctxName);
    }

    init() {
        this._itemsAddedHandler = this._itemsAdded.bind(this);
        this._itemsDeletedHandler = this._itemsDeleted.bind(this);
    }

    dispose() {
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

        const forExp = "for (let i = 0; i < context.length; i++) { callback(context[i], i) }";

        this._forExp = crsbinding.expression.compile(forExp, ["callback"], {sanitize: false, async: true, ctxName: this._ctxName});

        // 3. listen to the collection property on the context changing
        this._collectionChangedHandler = this._collectionChanged.bind(this);
        this.listenOnPath(this._plural, this._collectionChangedHandler);

        crsbinding.data.setArrayEvents(this._context, this._plural, this._itemsAddedHandler, this._itemsDeletedHandler);
    }

    async _collectionChanged(property, newValue) {
        if (newValue == null) return this._clear();
        this._renderItems(newValue);
    }

    _clear() {
        const elements = Array.from(this._container.children);

        for (let child of elements) {
            child.parentElement.removeChild(child);
            crsbinding.observation.releaseBinding(child);
        }
    }

    async _renderItems(array) {
        // release the old content
        await crsbinding.observation.releaseChildBinding(this._container);

        // create document fragment
        const fragment = document.createDocumentFragment();

        // loop through items and add them to fragment after being parsed
        await this._forExp.function(array, (item, index) => {
            const element = this.createElement(item, index);
            fragment.appendChild(element);
        });

        this._container.innerHTML = "";
        this._container.appendChild(fragment);

        // update the container's provider to this so that this can be freed when content changes
        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }
    }

    _itemsAdded(added) {
        console.log(added);
        // for (let i = 0; i < added.items.length; i++) {
        //     const item = added.items[i];
        //     const index = added.indexes[i];
        //
        //     const element = this.createElement(item);
        //     const update = element.children[0];
        //     const child = this._container.children[index];
        //     this._container.insertBefore(element, child);
        //
        //     for (let p of update.__providers || []) {
        //         const provider = crsbinding.providerManager.items.get(p);
        //         if (provider instanceof AttrProvider) {
        //             provider._change();
        //         }
        //     }
        // }
    }

    _itemsDeleted(removed) {
        console.log(removed);
        // const elements = [];
        //
        // const push = (item) => {
        //     const uid = item.__uid;
        //     const result = this._container.querySelectorAll([`[data-uid="${uid}"]`]);
        //     result.forEach(element => elements.push(element));
        // };
        //
        // if (Array.isArray(removed)) {
        //     for (let item of removed) {
        //         push(item)
        //     }
        // }
        // else {
        //     push(removed);
        // }
        //
        // for (let element of elements) {
        //     if (element != null) {
        //         element.parentElement.removeChild(element);
        //         crsbinding.observation.releaseBinding(element);
        //     }
        // }
    }

    createElement(item, index) {
        const id = crsbinding.data.createReferenceTo(this._context, `${this._context}-array-item-${index}`, this._plural, index);
        const element = this._element.content.cloneNode(true);
        crsbinding.parsers.parseElement(element, id, this._singular);
        return element;
    }
}