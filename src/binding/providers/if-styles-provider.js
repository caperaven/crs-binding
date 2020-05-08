import {ProviderBase} from "./provider-base.js";
import {setElementConditional} from "./code-constants.js";

export class IfStylesProvider extends ProviderBase {
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
        this._eventHandler = this.propertyChanged.bind(this);

        const value = crsbinding.expression.sanitize(this._value, this._ctxName);
        const parts = value.expression.split("?");
        const condition = parts[0].trim();

        const values = parts[1].split(":");
        const trueValue = values[0].trim();
        const falseValue = values.length > 1 ? values[1].trim() : '""';

        const fnCode = setElementConditional
            .split("__property__").join(this._property)
            .split("__exp__").join(condition)
            .split("__true__").join(trueValue)
            .split("__false__").join(falseValue);

        this._expObj = crsbinding.expression.compile(fnCode, ["element"], {sanitize: false, ctxName: this._ctxName});
        this.listenOnPath(value.properties, this._eventHandler);
        this.propertyChanged();
    }

    propertyChanged() {
        crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element));
    }
}