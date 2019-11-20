import {ProviderBase} from "./provider-base.js";

export class IfProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName) {
        super(element, context, property, value, ctxName);
    }

    dispose() {
        crsbinding.expression.release(this._expObj);
        delete this._expObj;

        this._eventHandler = null;
        super.dispose();
    }

    initialize() {
        this._eventHandler = this.propertyChanged.bind(this);

        if (this._value.indexOf("?") == -1) {
            this._initCndAttr();
        }
        else if(this._value.indexOf(":") != -1) {
            this._initCndValue();
        }
        else {
            this._initCndAttrValue();
        }
    }

    /**
     * There is no value to be set.
     * Add or remove the attribute.
     * Used for hidden.bind or disabled.bind
     * @private
     */
    _initCndAttr() {
        const value = crsbinding.expression.sanitize(this._value);
        const fnCode = initCndAttrExp
            .split("__exp__").join(value.expression)
            .split("__attr__").join(this._property)
            .split("__attr-value__").join(this._property);

        this._expObj = crsbinding.expression.compile(fnCode, ["element"], {sanitize: false, ctxName: this._ctxName});
        this.listenOnPath(value.properties, this._eventHandler);
    }

    /**
     * There is an attribute value that gets toggled do not remove the attribute
     * @private
     */
    _initCndValue() {
        const value = crsbinding.expression.sanitize(this._value);
        const parts = value.expression.split("?");
        const valueParts = parts[1].split(":");

        const fnCode = initCndValueExp
            .split("__exp__").join(parts[0].trim())
            .split("__attr__").join(this._property)
            .split("__true__").join(valueParts[0].trim())
            .split("__false__").join(valueParts[1].trim());

        this._expObj = crsbinding.expression.compile(fnCode, ["element"], {sanitize: false, ctxName: this._ctxName});
        this.listenOnPath(value.properties, this._eventHandler);
    }

    /**
     * if the expression passes set the attribute else remove the attribute
     * @private
     */
    _initCndAttrValue() {
        const value = crsbinding.expression.sanitize(this._value);
        const parts = value.expression.split("?");

        const fnCode = initCndAttrExp
            .split("__exp__").join(parts[0].trim())
            .split("__attr__").join(this._property)
            .split("__attr-value__").join(parts[1].trim());

        this._expObj = crsbinding.expression.compile(fnCode, ["element"], {sanitize: false, ctxName: this._ctxName});
        this.listenOnPath(value.properties, this._eventHandler);
    }

    propertyChanged() {
        crsbinding.idleTaskManager.add(this._expObj.function(this._context, this._element));
    }
}

const initCndAttrExp = `
if (__exp__) {
    element.setAttribute("__attr__", "__attr-value__");
}
else {
    element.removeAttribute("__attr__");
}
`;

const initCndValueExp = `
if (__exp__) {
    element.setAttribute("__attr__", "__true__");
}
else {
    element.setAttribute("__attr__", "__false__");
}
`;