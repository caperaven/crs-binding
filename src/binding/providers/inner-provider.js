import {ProviderBase} from "./provider-base.js";

export class InnerProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId);

        if (element.innerText && element.innerText.indexOf("$parent.") != -1) {
            element.innerText = element.innerText.split("$parent.").join("");
            this._context = parentId;
        }
        else if (element.textContent && element.textContent.indexOf("$parent.") != -1) {
            element.textContent = element.textContent.split("$parent.").join("");
            this._context = parentId;
        }

        this._value = element.innerText || element.textContent;
        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.expression.compile(element.innerText || element.textContent, null, {ctxName: this._ctxName});

        for (let prop of this._expObj.parameters.properties) {
            this.listenOnPath(prop, this._eventHandler);
        }

        this._change();
    }

    dispose() {
        crsbinding.expression.release(this._expObj);
        this._expObj = null;

        super.dispose();

        this._eventHandler = null;
    }

    _change(property, sourceValue) {
        if (this._expObj == null) return;
        const target = this._element.textContent ? "textContent" : "innerText";
        let value = this._expObj.function(this.data);

        if (sourceValue != value && property != null) {
            // if converter exists it means that the value has already been converted and should be used as is.
            const converter = crsbinding.data._getConverter(this._context, property);
            if (converter != null) {
                value = sourceValue;
            }
        }

        value = value == null ? "" : value.split("undefined").join("");
        this._element[target] = value;
    }
}