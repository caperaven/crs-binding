export class InnerProvider {
    constructor(element, context, property, value, ctxName) {
        this._element = element;
        this._context = context;
        this._ctxName = ctxName;

        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.expression.compile(element.innerText, null, {ctxName: this._ctxName});

        for (let prop of this._expObj.parameters.properties) {
            crsbinding.events.on(this._context, prop, this._eventHandler);
        }

        crsbinding.providerManager.register(this);
    }

    dispose() {
        crsbinding.expression.release(this._expObj);
        this._eventHandler = null;
        this._expObj = null;

        delete this._element;
        delete this._context;
    }

    _change() {
        this._element.innerText = this._expObj.function(this._context);
    }
}