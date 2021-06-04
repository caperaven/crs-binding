import {AttrProvider} from "./attr-provider.js";
import {RepeatBaseProvider} from "./repeat-base-provider.js";

export class ForProvider extends RepeatBaseProvider {
    init() {
        this._itemsAddedHandler = this._itemsAdded.bind(this);
        this._itemsDeletedHandler = this._itemsDeleted.bind(this);
    }

    dispose() {
        this._itemsAddedHandler = null;
        this._itemsDeletedHandler = null;

        super.dispose();
    }

    async initialize() {
        super.initialize();

        crsbinding.data.setArrayEvents(this._context, this._plural, this._itemsAddedHandler, this._itemsDeletedHandler);
    }

    async _renderItems(array) {
        await super._renderItems();

        // create document fragment
        const fragment = document.createDocumentFragment();

        // loop through items and add them to fragment after being parsed
        for (let item of array) {
            item.__aId = crsbinding.data.nextArrayId();
            const element = await this.createElement(item, item.__aId);
            fragment.appendChild(element);
        }

        this.positionStruct.addAction(fragment);

        // update the container's provider to this so that this can be freed when content changes
        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }

        this._container.dispatchEvent(new CustomEvent("rendered"));
    }

    _itemsAdded(added, collection) {
        for (let i = 0; i < added.length; i++) {
            const item = added[i];
            const index = collection.indexOf(item);

            item.__aId = crsbinding.data.nextArrayId();
            this.createElement(item, item.__aId).then(element => {
                const update = element.children[0];
                const child = this._container.children[index + this.positionStruct.startIndex + 1];
                this._container.insertBefore(element, child);

                this.updateAttributeProviders(update);
            })
        }
    }

    _itemsDeleted(removed, collection) {
        if (removed == null) return;

        const elements = [];
        const array = Array.isArray(removed) ? removed : [removed];

        for (let item of array) {
            const uid = item.__uid;
            const result = this._container.querySelectorAll([`[data-uid="${uid}"]`]);
            result.forEach(element => elements.push(element));
            crsbinding.data.removeObject(uid);
        }

        for (let element of elements) {
            if (element != null) {
                element.parentElement.removeChild(element);
                crsbinding.observation.releaseBinding(element);
            }
        }
    }
}