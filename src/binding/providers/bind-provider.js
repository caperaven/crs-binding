import {OneWayProvider} from "./one-way-provider.js";

const changeElements = ["INPUT", "SELECT", "TEXTAREA"];

export class BindProvider extends OneWayProvider {
    dispose() {
        this._element.removeEventListener(this._eventName, this._changeHandler);
        this._eventName = null;
        this._changeHandler = null;

        super.dispose();
    }

    async initialize() {
        await super.initialize();
        this._changeHandler = this._change.bind(this);
        
        this._eventName = (changeElements.indexOf(this._element.nodeName) !== -1) ? "change" :  `${this._property}Change`; 
        this._element.addEventListener(this._eventName, this._changeHandler);
    }

    _change(event) {
        let value = event.target[this._property];
        const type = event.target.type || "text";
        const typeFn = `_${type}`;

        if (this[typeFn] != null) {
            value = this[typeFn](value, event.target);
        }

        crsbinding.data.setProperty(this._context, this._value, value, this._ctxName, type == "text" ? "string" : type);

        event.stopPropagation();
    }

    _number(value) {
        return Number(value);
    }

    _date(value) {
        return new Date(value);
    }

    _checkbox(value, element) {
        return element.checked == true;
    }
}