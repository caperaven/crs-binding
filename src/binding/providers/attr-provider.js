import {ProviderBase} from "./provider-base.js";

export class AttrProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId);

        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.expression.compile(this._value, null, {ctxName: this._ctxName});

        for (let prop of this._expObj.parameters.properties) {
            this.listenOnPath(prop, this._eventHandler);
        }

        this._change();
    }

    dispose() {
        crsbinding.expression.release(this._expObj);
        this._expObj = null;

        super.dispose();

        this._eventHandler = null;
    }

    _change() {
        const value = this._expObj.function(this.data);
        this._element.setAttribute(this._property, value);
    }
}