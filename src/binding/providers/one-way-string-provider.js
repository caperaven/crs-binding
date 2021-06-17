import {getExpForProvider} from "./one-way-utils.js";
import {ProviderBase} from "./provider-base.js";

export class OneWayStringProvider extends ProviderBase {
    dispose() {
        if (this._expObj != null) {
            crsbinding.expression.release(this._expObj);
            delete this._expObj;
        }

        this._exp = null;
        this._getValueFn = null;
        this._eventHandler = null;
        super.dispose();
    }

    async initialize() {
        this._eventHandler = this.propertyChanged.bind(this);

        this._exp = getExpForProvider(this);
        this._expObj = crsbinding.expression.compile(this._exp, ["element", "value"], {sanitize: false, ctxName: this._ctxName});

        const san = crsbinding.expression.sanitize(this._value, this._ctxName);
        this._getValueFn = new Function(this._ctxName, `return ${san.expression}`);;

        for (let property of san.properties) {
            this.listenOnPath(property, this._eventHandler);
        }

        this.propertyChanged();
    }

    propertyChanged() {
        const value = this._getValueFn(this.data);
        crsbinding.idleTaskManager.add(this._expObj.function(this.data, this._element, value));
    }
}