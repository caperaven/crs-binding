import {ProviderBase} from "./provider-base.js";
import {setElementProperty, setElementValueProperty, setAttribute, setClassList, setDataset} from "./code-constants.js";

export class OneWayProvider extends ProviderBase {
    dispose() {
        const contextPrefix = `${this._ctxName}.`;
        if (this._value.indexOf(contextPrefix) == 0) {
            this._value = this._value.replace(contextPrefix, "");
        }
        this.removeOn(this._value, this._eventHandler);

        if (this._expObj != null) {
            crsbinding.expression.release(this._expObj);
            delete this._expObj;
        }

        if (this._getObj != null) {
            crsbinding.expression.release(this._getObj);
            delete this._getObj;
        }

        this._exp = null;
        this._eventHandler = null;
        super.dispose();
    }

    async initialize() {
        if (this._value == "$context") {
            return this.setContext();
        }

        this._eventHandler = this.propertyChanged.bind(this);
        this._exp = getExpForProvider(this);

        this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], {sanitize: false, ctxName: this._ctxName});

        if (this._value.indexOf(".") != -1) {
            this._getObj = crsbinding.expression.compile(this._value, null, {ctxName: this._ctxName});
        }

        this.listenOnPath(this._value, this._eventHandler);

        const v = this._ctxName == "context" ? this._context[this._value] : this._context;
    }

    setContext() {
        if (this._element != null && this._property != null) {
            this._element[this._property] = this._context;
        }
    }

    propertyChanged(prop, value) {
        if (this._expObj == null) return;
        crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, value));
    }
}

function getExpForProvider(provider) {
    let result;

    if (provider._property.toLocaleLowerCase() == "classlist") {
        return setClassList;
    }

    if (provider._property.indexOf("data-") != -1) {
        const prop = provider._property.replace("data-", "");
        return setDataset.split("__property__").join(prop);
    }
    
    result = provider._property == "value" ? setElementValueProperty : setElementProperty;
    provider._property = crsbinding.utils.capitalizePropertyPath(provider._property);
    
    return result.split("__property__").join(provider._property);
}