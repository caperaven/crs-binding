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
        this._eventHandler = this.propertyChanged.bind(this);
        this._properties = [];

        createConditionsCode.call(this);

        this.listenOnPath(this._properties, this._eventHandler);
        this.propertyChanged();
    }

    dispose() {
        this.properties = null;
        this.fn = null;
        this._eventHandler = null;
        super.dispose();
    }

    propertyChanged() {
        try {
            crsbinding.idleTaskManager.add(this.fn(this.data, this._element));
        }
        catch {
            return;
        }
    }
}

function createConditionsCode() {
    const parts = this._value.split(",");
    const code = [];

    let hasDefault = false;

    for (const part of parts) {
        const subParts = part.split(":");
        const attr = this._property;
        const value = subParts[1].trim();

        if (subParts[0].trim() == "default") {
            hasDefault = true;

            code.push(setAttrCode
                .replace("__attr__", attr)
                .replace("__value__", value));

            continue;
        }

        const san_exp = crsbinding.expression.sanitize(subParts[0].trim(), this._ctxName);
        this._properties = [...this._properties, ...san_exp.properties];

        code.push(setValueCode
            .replace("__expr__", san_exp.expression)
            .replace("__attr__", attr)
            .replace("__value__", value)
        )
    }

    if (hasDefault == false) {
        code.push(`element.removeAttribute("${this._property}");`)
    }

    const set = new Set(this._properties);
    this._properties = Array.from(set);

    this.fn = new AsyncFunction("context", "element", code.join(""));
}