export class InnerProvider {
    constructor(element, context) {
        this._element = element;
        this._context = context;

        this._eventHandler = this._change.bind(this);
        this._expObj = crsbinding.compileExp(element.innerText);

        for (let prop of this._expObj.parameters.properties) {
            crsbinding.events.on(this._context, prop, this._eventHandler);
        }

        crsbinding.providerManager.register(this);
    }

    dispose() {
        crsbinding.releaseExp(this._expObj);
        this._eventHandler = null;
        this._expObj = null;

        delete this._element;
        delete this._context;
    }

    _change() {
        this._element.innerText = this._expObj.function(this._context);
    }
}