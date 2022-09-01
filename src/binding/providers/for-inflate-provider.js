import {ProviderBase} from "./provider-base.js";
import {forStatementParts} from "./../../lib/utils.js";


export class ForInflateProvider extends ProviderBase {
    dispose() {
        crsbinding.inflationManager.unregister(this.key);

        this._collectionChangedHandler = null;
        this._parentElement = null;
        this.singular = null;
        this.plural = null;
        this.key = null;

        super.dispose();
    }

    async initialize() {
        this._parentElement = this._element.parentElement;
        this.clear();

        const parts = forStatementParts(this._value);
        this.singular = parts.singular;
        this.plural = parts.plural;

        this.key = this._element.dataset.id;

        if (this.key == null) {
            console.error("for.inflate must have a data-id attribute");
            return;
        }

        crsbinding.inflationManager.register(this.key, this._element, this.singular);
        this._collectionChangedHandler = this._collectionChanged.bind(this);
        this.listenOnPath(this.plural, this._collectionChangedHandler);
    }

    async _collectionChanged(context, newValue) {
        if (newValue == null) return this._clear();

        const fragment = crsbinding.inflationManager.get(this.key, newValue, this._parentElement.children);

        if (fragment?.childElementCount > 0) {
            this._parentElement.appendChild(fragment);
        }
   }

    clear() {
        this._parentElement.innerHTML = "";
    }
}