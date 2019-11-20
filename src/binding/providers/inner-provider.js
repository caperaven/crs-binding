import {ProviderBase} from "./provider-base.js";

export class InnerProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName) {
        super(element, context, property, value, ctxName);

        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.expression.compile(element.innerText, null, {ctxName: this._ctxName});

        for (let prop of this._expObj.parameters.properties) {
            this.listenOnPath(prop, this._eventHandler);
        }

        crsbinding.providerManager.register(this);
    }

    dispose() {
        crsbinding.expression.release(this._expObj);
        this._eventHandler = null;
        this._expObj = null;

        delete this._element;
        delete this._context;
    }

    _change() {
        this._element.innerText = this._expObj.function(this._context);
    }
}