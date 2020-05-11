import {ProviderBase} from "./provider-base.js";

export class CallProvider extends ProviderBase {
    constructor(element, context, property, value, ctxName, parentId) {
        super(element, context, property, value, ctxName, parentId);
        this._eventHandler = this.event.bind(this);
        this._element.addEventListener(this._property, this._eventHandler);
    }

    dispose() {
        this._element.removeEventListener(this._property, this._eventHandler);
        this._eventHandler = null;
        this._fn = null;

        super.dispose();
    }

    async initialize() {
        let src = `context.${this._value}`.split("$event").join("event");
        if (src.indexOf(")") == -1) {
            src = `${src}.call(context)`;
        }
        this._fn = new Function("context", src);
    }

    event(event) {
        const context = crsbinding.data.getContext(this._context);
        crsbinding.idleTaskManager.add(this._fn(context));
        event.stopPropagation();
    }
}