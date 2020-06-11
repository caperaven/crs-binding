import {CallProvider} from "./call-provider.js";

export class SetValueProvider extends CallProvider {
    async initialize() {
        const parts = this._value.split("=");

        const value = this._processRightPart(parts[1].trim());
        const src = this._processLeftPart(parts[0].trim(), value);

        this._fn = new Function("context", src);
    }

    _processRightPart(part) {
        return crsbinding.expression.sanitize(part).expression;
    }

    _processLeftPart(part, value) {
        if (part.indexOf("$globals") != -1) {
            return this._getGlobalSetter(part, value);
        }
        else {
            return this._getContextSetter(part, value);
        }
    }

    _getGlobalSetter(part, value) {
        const path = part.replace("$globals.", "");
        return `crsbinding.data.setProperty(crsbinding.$globals, "${path}", ${value});`;
    }

    _getContextSetter(part, value) {
        return `crsbinding.data.setProperty(${this._context}, "${part}", ${value});`;
    }
}
