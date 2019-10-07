import {ProviderBase} from "./provider-base.js";

export class CallProvider extends ProviderBase {
    constructor(element, context, property, value) {
        super(element, context, property, value);
        this.initialize();
        this._eventHandler = this.event.bind(this);
        this._element.addEventListener(this._property, this._eventHandler);
    }

    dispose() {
        this._element.removeEventListener(this._property, this._eventHandler);
        this._eventHandler = null;
        this._fn = null;

        super.dispose();
    }

    initialize() {
        let src = `context.${this._value}`.split("$event").join("event");
        if (src.indexOf(")") == -1) {
            src = `${src}()`;
        }
        this._fn = new Function("context", src);
    }

    event() {
        crsbinding.idleTaskManager.add(this._fn(this._context));
    }
}