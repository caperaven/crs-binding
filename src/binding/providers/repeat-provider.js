export class RepeatProvider {
    constructor(element, context) {
        this._element = element;
        this._context = context;
        this._eventHandler = this._collectionChanged.bind(this);

        crsbinding.providerManager.register(this);
        this.initialize().catch(error => console.error(error));
    }

    dispose() {
        delete this._element;
        delete this._context;

        crsbinding.expression.release(this._expObj);
        delete this._expObj;
    }

    async initialize() {
        this._container = this._element.parentElement;
        this._container.removeChild(this._element);
        const exp = this._element.getAttribute("repeat");

        this._expObj = crsbinding.expression.compile(exp);

        if (exp.indexOf(".") == -1) {
            crsbinding.events.listenOn(this._context, exp, this._eventHandler);
        }
        else {
            crsbinding.events.listenOnPath(this._context, exp, this._eventHandler);
        }

        await this._renderCollection();
    }

    async _renderCollection() {
        const ar = this._expObj.function(this._context);
        if (ar == null) return;

        const fragment = document.createDocumentFragment();

        for (let item of ar) {
            const element = this._element.content.cloneNode(true);
            await crsbinding.parsers.parseElement(element, item);
            fragment.appendChild(element);
        }

        this._container.innerHTML = "";
        this._container.appendChild(fragment);

        crsbinding.expression.updateUI(ar);
    }

    _collectionChanged() {
        this._renderCollection();
    }
}