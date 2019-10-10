import {ProviderBase} from "./provider-base.js";

export class OneWayProvider extends ProviderBase {
    dispose() {
        this._context.removeOn(this._value, this._exp.function);

        crsbinding.releaseExp(this._expObj);
        delete this._expObj;

        if (this._getObj != null) {
            crsbinding.releaseExp(this._getObj);
            delete this._getObj;
        }

        delete this._exp;

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

        this._expObj = crsbinding.compileExp(this._exp, ["element", "value"], false);

        if (this._value.indexOf(".") != -1) {
            this._getObj = crsbinding.compileExp(this._value);
        }

        if (this._value.indexOf(".") == -1) {
            this._listenOn(this._context, this._value);
        }
        else {
            this._listenOnPath();
        }
    }

    _listenOnPath() {
        let obj = this._context;
        const parts = this._value.split(".");

        for (let i = 0; i < parts.length; i++) {
            const part = parts[i];
            if (i == parts.length -1) {
                this._listenOn(obj, part);
            }
            else {
                if (obj[part] == null) {
                    obj[part] = crsbinding.observe({})
                }

                this._listenOn(obj, part);
                obj = obj[part];
            }
        }
    }

    _listenOn(context, property) {
        context.on(property, this._eventHandler);
    }

    propertyChanged(prop, value) {
        let v = value;
        if (this._getObj != null) {
            v = this._getObj.function(this._context);
        }
        crsbinding.idleTaskManager.add(this._expObj.function(this._context, this._element, v));
    }
}