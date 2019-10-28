import {OneWayProvider} from "./one-way-provider.js";

export class BindProvider extends OneWayProvider {
    dispose() {
        this._element.removeEventListener("change", this._changeHandler);
        this._changeHandler = null;

        crsbinding.expression.release(this._setObj);
        delete this._setObj;

        super.dispose();
    }

    initialize() {
        super.initialize();
        this._changeHandler = this._change.bind(this);
        this._element.addEventListener("change", this._changeHandler);

        this._setObj = crsbinding.expression.compile(`context.${this._value} = value`, ["value"], false);
    }

    _change(event) {
        let value = event.target.value;
        const type = event.target.type || "text";
        const typeFn = `_${type}`;

        if (this[typeFn] != null) {
            value = this[typeFn](value);
        }

        this._setObj.function(this._context, value);
    }

    _number(value) {
        return Number(value);
    }

    _date(value) {
        return new Date(value);
    }
}