export class ProviderBase {
    constructor(element, context, property, value) {
        this._element = element;
        this._context = context;
        this._property = property;
        this._value = value;

        crsbinding.providerManager.register(this);
    }

    dispose() {
        delete this._element;
        delete this._context;
        delete this._property;
        delete this._value;
    }
}