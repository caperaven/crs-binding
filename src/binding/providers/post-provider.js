import {EmitProvider} from "./emit-provider.js";

export class PostProvider extends EmitProvider {
    async initialize() {
        const queryStartIndex = this._value.indexOf("[");
        const queryEndIndex = this._value.indexOf("]");
        const queries = this._value.substring(queryStartIndex + 1, queryEndIndex).split(" ").join("").split(",");
        const name = this._value.substring(0, queryStartIndex).trim();


        const argsStr = [`{key: "${name}",`];

        const argsStartIndex = this._value.indexOf("(");
        const argsEndIndex = this._value.indexOf(")");

        if (argsStartIndex != -1) {
            const args = this._value.substring(argsStartIndex + 1, argsEndIndex);
            this._getParametersCode(args, argsStr);
        }

        argsStr.push("}");

        const src = this._getSource(queries, argsStr.join(""));
        this._fn = new Function("context", src);
    }

    _getSource(queries, args) {
        const code = [];
        for (let query of queries) {
            query = query.split("'").join("").split('"').join("");
            code.push(`crsbinding.events.emitter.postMessage("${query}", ${args});`);
        }
        return code.join("\n");
    }
}