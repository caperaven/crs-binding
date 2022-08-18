import {ProviderBase} from "./provider-base.js";
import {AsyncFunction} from "./../../events/compiler.js";

const setValueCode = `
if (__expr__) {
    return element.setAttribute("__attr__", __value__);
}
`;

const setAttrCode = 'return element.setAttribute("__attr__", __value__);';

export class CaseAttrProvider extends ProviderBase {
    async initialize() {
        createConditionsCode.call(this);
    }
}

function createConditionsCode() {
    const parts = this._value.split(",");
    const code = [];

    for (const part of parts) {
        const subParts = part.split(":");
        const attr = this._property;
        const value = subParts[1].trim();

        if (subParts[0].trim() == "default") {
            code.push(setAttrCode
                .replace("__attr__", attr)
                .replace("__value__", value));

            continue;
        }

        const san_exp = crsbinding.expression.sanitize(subParts[0].trim(), this._ctxName);

        code.push(setValueCode
            .replace("__expr__", san_exp.expression)
            .replace("__attr__", attr)
            .replace("__value__", value)
        )
    }

    this.fn = new AsyncFunction(this.ctxName, "element", code.join(""));
}