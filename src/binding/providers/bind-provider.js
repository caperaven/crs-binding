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

        if(this._value.indexOf("$globals.") !== -1) {
            this._context = crsbinding.$globals;
            this._value = this._value.split("$globals.").join("");
        }
    }

    _change(event) {
        let value = event.target[this._property];
        const type = event.target.type || "text";
        const typeFn = `_${type}`;

        if (this[typeFn] != null) {
            value = this[typeFn](value, event.target);
        }

        if (this._converter != null) {
            const converter = crsbinding.valueConvertersManager.get(this._converter.converter);
            value = converter.set(value, this._converter.parameter);
        }

        const path = this._converter == null ? this._value : this._converter.path;
        const oldValue = crsbinding.data.getValue(this._context, this._value);
        crsbinding.data._setContextProperty(this._context, path, value, {oldValue: oldValue, ctxName: this._ctxName, dataType: type == "text" ? "string" : type});

        event.stopPropagation();
    }

    _number(value) {
        if (value == null || value == "") return null;
        return Number(value);
    }

    _date(value) {
        return new Date(value);
    }

    _checkbox(value, element) {
        return element.checked == true;
    }
}