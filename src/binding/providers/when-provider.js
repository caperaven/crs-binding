import {ProviderBase} from "./provider-base.js";

export class WhenProvider extends ProviderBase {
    dispose() {
        for (let prop of this._getValueFn.parameters.properties) {
            this._context.removeOn(prop, this._eventHandler);
        }

        this._eventHandler = null;
        this._exp = null;
        this._condition = null;

        crsbinding.releaseExp(this._expObj);
        crsbinding.releaseExp(this._getValueFn);

        delete this._expObj;
        delete this._getValueFn;

        super.dispose();
    }

    initialize() {
        this._eventHandler = this._when.bind(this);

        if (this._property.indexOf("-") == -1) {
            this._exp = `element["${this._property}"] = value`;
        }
        else {
            this._exp = `element.setAttribute("${this._property}", value)`;
        }

        this._expObj = crsbinding.compileExp(this._exp, ["element", "value"], false);

        this._getExpressionParts();
    }

    _when() {
        const value = this._getValueFn.function(this._context);
        crsbinding.idleTaskManager.add(this._expObj.function(this._context, this._element, value));
    }

    _getExpressionParts() {
        const parts = this._value.split("?");
        this._condition = parts[0].trim();

        this._getValueFn = crsbinding.compileExp(this._value);

        for (let prop of this._getValueFn.parameters.properties) {
            crsbinding.events.on(this._context, prop, this._eventHandler);
        }
    }
}