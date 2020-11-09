import {ProviderBase} from "./provider-base.js";
import {getExpForProvider, setContext} from "./one-way-utils.js";

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
            return setContext(this._element, this._property, this._context);
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

    propertyChanged(prop, value) {
        if (this._expObj == null) return;

        if (this._isLinked != true && this._element._dataId != null) {
            crsbinding.data.link(this._context, prop, this._element._dataId, this._property, value);
            this._isLinked = true;
        }

        if (this._element.type == "date") {
            value = (new Date(value)).toISOString().split('T')[0];
        }

        crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, value));
    }
}