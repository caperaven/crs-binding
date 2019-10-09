import {ProviderBase} from "./provider-base.js";

export class OneWayProvider extends ProviderBase {
    dispose() {
        this._context.removeOn(this._value, this.exp.function);

        delete this.expObj;
        crsbinding.releaseExp(this.exp);

        this.propertyChangedHandler = null;
        this.exp = null;
        super.dispose();
    }

    initialize() {
        this.propertyChangedHandler = this.propertyChanged.bind(this);
        this.exp = `element["${this._property}"] = value`;
        this.expObj = crsbinding.compileExp(this.exp, ["element", "value"], false);
        this._context.on(this._value, this.propertyChangedHandler);
    }

    propertyChanged(property, value) {
        this.expObj.function(this._context, this._element, value);
    }
}