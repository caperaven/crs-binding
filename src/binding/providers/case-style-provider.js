import {ProviderBase} from "./provider-base.js";
import {AsyncFunction} from "./../../events/compiler.js";

const setValueCode = `
if (__expr__) {
    return element.__property__ = __value__;
}
`;

const setAttrCode = 'return element.__property__ = __value__;';

export class CaseStyleProvider extends ProviderBase {
    async initialize() {
        this._eventHandler = this.propertyChanged.bind(this);
        this._properties = [];

        createConditionsCode.call(this);

        this.listenOnPath(this._properties, this._eventHandler);
        this.propertyChanged();
    }

    dispose() {
        this.san_exp = null;
        this.fn = null;
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

    for (const part of parts) {
        const subParts = part.split(":");
        const value = subParts[1].trim();

        if (subParts[0].trim() == "default") {
            code.push(setAttrCode
                .replace("__property__", this._property)
                .replace("__value__", value));

            continue;
        }

        const san_exp = crsbinding.expression.sanitize(subParts[0].trim(), this._ctxName);
        this._properties = [...this._properties, ...san_exp.properties];

        code.push(setValueCode
            .replace("__expr__", san_exp.expression)
            .replace("__property__", this._property)
            .replace("__value__", value)
        )
    }

    const set = new Set(this._properties);
    this._properties = Array.from(set);

    this.fn = new AsyncFunction("context", "element", code.join(""));
}