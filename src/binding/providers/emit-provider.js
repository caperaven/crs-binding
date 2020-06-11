import {CallProvider} from "./call-provider.js";

export class EmitProvider extends CallProvider {
    async initialize() {
        const fnParts = this._value.split("(");
        const name = fnParts[0];

        const argsStr = [`{`];
        if (fnParts.length > 0) {
            this._getParametersCode(fnParts[1], argsStr);
        }
        argsStr.push("}");

        const src = this._getSource(name, argsStr.join(""));
        this._fn = new Function("context", src);
    }

    _getSource(name, args) {
        return `crsbinding.events.emitter.emit("${name}", ${args});`;
    }

    _getParametersCode(parameters, args) {
        if (parameters == null) return;
        const argParts = parameters.split(")").join("").split(",");

        for (let i = 0; i < argParts.length; i++) {
            const ap = argParts[i];
            const v = ap.trim();

            if (this[v] != null) {
                this[v](args);
            }
            else {
                this._processArg(v, args);
            }

            if (i < argParts.length - 1) {
                args.push(",");
            }
        }
    }

    "$event"(args) {
        args.push("event: event");
    }

    "$context"(args) {
        args.push("context: context");
    }

    _processArg(value, args) {
        const parts = value.split("=");
        const property = parts[0].trim();
        const code = this._processValue(parts[1]);
        args.push(`${property}:${code}`)
    }

    _processValue(value) {
        if (value.indexOf("${") != -1)
        {
            return value.split("${").join("context.").split("}").join("");
        }

        return value;
    }
}