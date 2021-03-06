import {CallProvider} from "./call-provider.js";

export class SetValueProvider extends CallProvider {
    async initialize() {
        const src = this._createSource();
        this._fn = new Function("context", "event", "setProperty", src);
    }

    _createSource() {
        if (this._value.trim()[0] != "[") {
            return this._createSourceFrom(this._value);
        }

        const result = [];
        const exps = this._value.substr(1, this._value.length - 2);
        const parts = exps.split(";");

        for (let part of parts) {
            result.push(this._createSourceFrom(part.trim()));
        }

        return result.join("\n");
    }

    _createSourceFrom(exp) {
        const parts = exp.split("=");

        const value = this._processRightPart(parts[1].trim());
        const src = this._processLeftPart(parts[0].trim(), value);
        return src;
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
        return `crsbinding.data.setProperty({_dataId: crsbinding.$globals}, "${path}", ${value});`;
    }

    _getContextSetter(part, value) {
        part = part.replace("$context.", "");

        if (value.indexOf("context.") != -1) {
            const parts = value.split("context.");
            const property = parts[parts.length -1];
            let prefix = parts[0] == "!" ? "!" : "";
            value = `${prefix}crsbinding.data.getValue({_dataId: ${this._context}}, "${property}")`;
        }

        return `crsbinding.data.setProperty({_dataId: ${this._context}}, "${part}", ${value});`;
    }

    event(event) {
        const context = crsbinding.data.getContext(this._context);
        crsbinding.idleTaskManager.add(this._fn(context, event, this._setProperty));
        event.stopPropagation();
    }

    _setProperty(obj, property, value) {
        if (value !== undefined) {
            crsbinding.data.setProperty(this, property, value);
        }
    }
}
