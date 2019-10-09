import {ProviderBase} from "./provider-base.js";

export class OneWayProvider extends ProviderBase {
    dispose() {
        this._context.removeOn(this._value, this._exp.function);

        delete this._expObj;
        crsbinding.releaseExp(this._exp);

        this._eventHandler = null;
        this._exp = null;
        super.dispose();
    }

    initialize() {
        this._eventHandler = this.propertyChanged.bind(this);
        this._exp = `element["${this._property}"] = value`;
        this._expObj = crsbinding.compileExp(this._exp, ["element", "value"], false);
        this._context.on(this._value, this._eventHandler);
    }

    propertyChanged(property, value) {
        crsbinding.idleTaskManager.add(this._expObj.function(this._context, this._element, value));
    }
}