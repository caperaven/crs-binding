import {ProviderBase} from "./provider-base.js";

export class InnerProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId);

        const elementText = element.textContent;

        if (elementText.indexOf("$parent.") != -1) {
            element.textContent = elementText.split("$parent.").join("");
            this._context = parentId;
        }

        this._value = elementText;
        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.expression.compile(this._value, null, {ctxName: this._ctxName});

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

    _change() {
        if (this._expObj == null) return;
        let value = this._expObj.function(this.data);
        value = value == null ? "" : value.split("undefined").join("");
        let target = "textContent";

        if (this._expObj.parameters.isHTML == true) {
            target = "innerHTML";
        }

        this._element[target] = value;
    }
}