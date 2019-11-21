import {OneWayProvider} from "./one-way-provider.js";

export class BindProvider extends OneWayProvider {
    dispose() {
        this._element.removeEventListener("change", this._changeHandler);
        this._changeHandler = null;

        crsbinding.expression.release(this._setObj);
        delete this._setObj;

        super.dispose();
    }

    async initialize() {
        await super.initialize();
        this._changeHandler = this._change.bind(this);
        this._element.addEventListener("change", this._changeHandler);

        const exp = this._isNamedContext == true ? `${this._value} = value` : `context.${this._value} = value`;
        this._setObj = crsbinding.expression.compile(exp, ["value"], {sanitize: false, ctxName: this._ctxName});
    }

    _change(event) {
        let value = event.target.value;
        const type = event.target.type || "text";
        const typeFn = `_${type}`;

        if (this[typeFn] != null) {
            value = this[typeFn](value, event.target);
        }

        this._setObj.function(this._context, value);
    }

    _number(value) {
        return Number(value);
    }

    _date(value) {
        return new Date(value);
    }

    _checkbox(value, element) {
        return element.checked;
    }
}