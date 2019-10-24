export class RepeatProvider {
    constructor(element, context) {
        this._element = element;
        this._context = context;

        crsbinding.providerManager.register(this);
        this.initialize();
    }

    dispose() {
        delete this._element;
        delete this._context;

        crsbinding.releaseExp(this._expObj);
        delete this._expObj;
    }

    initialize() {
        this._container = this._element.parentElement;
        this._container.removeChild(this._element);
        const exp = this._element.getAttribute("repeat");

        this._expObj = crsbinding.compileExp(exp);
        this._renderCollection();
    }

    _renderCollection() {
        const ar = this._expObj.function(this._context);
        console.log(ar);
    }
}