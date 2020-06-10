import {CallProvider} from "./call-provider.js";

export class EmitProvider extends CallProvider {
    async initialize() {
        const fnParts = this._value.split("(");
        const name = fnParts[0];

        const aStr = ["{"];
        if (fnParts.length > 0) {
            const argParts = fnParts[1].split(")").join("").split(",");
            for (let i = 0; i < argParts.length; i++) {
                const ap = argParts[i];
                const v = ap.trim();

                switch(v) {
                    case "$event":
                        aStr.push("event: event");
                        break;
                    case "$context":
                        aStr.push("context: context");
                        break;
                    default:
                        const vParts = v.split("=");
                        aStr.push(`${vParts[0]}:${vParts[1]}`)
                }

                if (i < argParts.length - 1) {
                    aStr.push(",");
                }
            }
        }
        aStr.push("}");

        const src = `crsbinding.events.emitter.emit("${name}", ${aStr.join("")});`;
        this._fn = new Function("context", src);
    }
}