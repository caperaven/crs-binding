import {ProviderBase} from "./provider-base.js";

export class IfClassProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName) {
        super(element, context, property, value, ctxName);
    }

    dispose() {
        crsbinding.expression.release(this._expObj);
        delete this._expObj;

        this._eventHandler = null;
        super.dispose();
    }

    async initialize() {
        console.log("class provider")
    }
}