import {CallProvider} from "./call-provider.js";

export class SetValueProvider extends CallProvider {
    async initialize() {
        const parts = this._value.split("=");

        const value = this._processRightPart(parts[1].trim());
        const src = this._processLeftPart(parts[0].trim(), value);

        this._fn = new Function("context", src);
    }

    _processRightPart(part) {
        return crsbinding.expression.sanitize(part, this._ctxName, true).expression;
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
        part = part.replace("$context.", "");

        if (value.indexOf("context.") != -1) {
            const parts = value.split("context.");
            const property = parts[parts.length -1];
            let prefix = parts[0] == "!" ? "!" : "";
            value = `${prefix}crsbinding.data.getValue(${this._context}, "${property}")`;
        }

        return `crsbinding.data.setProperty(${this._context}, "${part}", ${value});`;
    }
}
