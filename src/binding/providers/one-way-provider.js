import {ProviderBase} from "./provider-base.js";
import {setElementProperty, setElementValueProperty, setClassList, setDataset} from "./code-constants.js";

export class OneWayProvider extends ProviderBase {
    dispose() {
        const contextPrefix = `${this._ctxName}.`;
        if (this._value.indexOf(contextPrefix) == 0) {
            this._value = this._value.replace(contextPrefix, "");
        }

        if (this._expObj != null) {
            crsbinding.expression.release(this._expObj);
            delete this._expObj;
        }

        this._exp = null;
        this._eventHandler = null;
        super.dispose();
    }

    async initialize() {
        if (this._value == "$context" || this._value == this._ctxName) {
            return this.setContext();
        }

        this._eventHandler = this.propertyChanged.bind(this);
        this._exp = getExpForProvider(this);

        this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], {sanitize: false, ctxName: this._ctxName});

        let path = this._value;
        if (this._isNamedContext == true) {
            path = this._value.split(`${this._ctxName}.`).join("");
        }

        this.listenOnPath(path, this._eventHandler);

        const value = crsbinding.data.getValue(this._context, path);
        if (value != null) {
            this.propertyChanged(path, value);
        }
    }

    setContext() {
        if (this._element != null && this._property != null) {
            const fn = () => {
                this._element.removeEventListener("ready", fn);
                this._element[this._property] = crsbinding.data.getValue(this._context);
            };

            if (this._element.isReady == true) {
                fn();
            }
            else {
                this._element.addEventListener("ready", fn);
            }
        }
    }

    propertyChanged(prop, value) {
        if (this._expObj == null) return;

        if (this._isLinked != true && this._element._dataId != null) {
            crsbinding.data.link(this._context, prop, this._element._dataId, this._property, value);
            this._isLinked = true;
        }

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
    
    result = provider._property == "value" || provider._property == "placeholder" ? setElementValueProperty : setElementProperty;
    provider._property = crsbinding.utils.capitalizePropertyPath(provider._property);
    
    return result.split("__property__").join(provider._property);
}