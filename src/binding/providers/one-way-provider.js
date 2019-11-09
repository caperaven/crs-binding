import {ProviderBase} from "./provider-base.js";

export class OneWayProvider extends ProviderBase {
    dispose() {
        crsbinding.expression.release(this._expObj);
        delete this._expObj;

        if (this._getObj != null) {
            crsbinding.expression.release(this._getObj);
            delete this._getObj;
        }

        this._exp = null;

        this._eventHandler = null;
        super.dispose();
    }

    initialize() {
        this._eventHandler = this.propertyChanged.bind(this);

        if (this._property.indexOf("-") == -1) {
            this._exp = `requestAnimationFrame(() => element["${this._property}"] = value || "")`;
        }
        else {
            this._exp = `element.setAttribute("${this._property}", value || "")`;
        }

        this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], false);

        if (this._value.indexOf(".") != -1) {
            this._getObj = crsbinding.expression.compile(this._value);
        }

        this.listenOnPath(this._value, this._eventHandler);
    }

    propertyChanged(prop, value) {
        let v = value;
        if (this._getObj != null) {
            v = this._getObj.function(this._context);
        }
        crsbinding.idleTaskManager.add(this._expObj.function(this._context, this._element, v));
    }
}