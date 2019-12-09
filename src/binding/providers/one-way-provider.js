import {ProviderBase} from "./provider-base.js";

export class OneWayProvider extends ProviderBase {
    dispose() {
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

        // if (this._property.indexOf("-") == -1) {
        //     this._exp = `requestAnimationFrame(() => element["${this._property}"] = value || "")`;
        // }
        // else {
        //     this._exp = `element.setAttribute("${this._property}", value || "")`;
        // }

        this._exp = getExpForProvider(this);

        this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], {sanitize: false, ctxName: this._ctxName});

        if (this._value.indexOf(".") != -1) {
            this._getObj = crsbinding.expression.compile(this._value, null, {ctxName: this._ctxName});
        }

        this.listenOnPath(this._value, this._eventHandler);
    }

    setContext() {
        if (this._element != null && this._property != null) {
            this._element[this._property] = this._context;
        }
    }

    propertyChanged(prop, value) {
        let v = value;
        if (this._getObj != null) {
            v = this._getObj.function(this._context);
        }
        crsbinding.idleTaskManager.add(this._expObj.function(this._context, this._element, v));
    }
}

function getExpForProvider(provider) {
    let result;

    if (provider._property.toLocaleLowerCase() == "classlist") {
        return setClassList;
    }

    result = provider._property.indexOf("-") == -1 ? setElementProperty : setAttribute;
    return result.split("__property__").join(provider._property);
}

const setElementProperty = `requestAnimationFrame(() => element["__property__"] = value || "")`;
const setAttribute = `element.setAttribute("__property__", value || "")`;
const setClassList = `if (element.__classList!=null) {const remove = Array.isArray(element.__classList) ? element.__classList : [element.__classList];remove.forEach(cls => element.classList.remove(cls));}element.__classList = value;const add = Array.isArray(value) ? value : [value];add.forEach(cls => element.classList.add(cls));`;
