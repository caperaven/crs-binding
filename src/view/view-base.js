export class ViewBase {
    get title() {
        return this.getProperty("title");
    }

    set title(newValue) {
        this.setProperty("title", newValue);
    }

    get element() {
        return this._element;
    }

    set element(newValue) {
        this._element = newValue;
    }

    constructor(element) {
        this.__dataId = crsbinding.data.addObject(this.constructor.name);
        this.element = element;
    }

    async connectedCallback() {
        this.__isProxy = true;

        crsbinding.parsers.parseElement(this.element, this.__dataId);

        this._loaded();
    }

    async disconnectedCallback() {
        crsbinding.observation.releaseBinding(this.element);
        crsbinding.utils.disposeProperties(this);
        this.element = null;
    }

    getProperty(property) {
        return crsbinding.data.getValue(this.__dataId, property);
    }

    setProperty(property, value) {
        crsbinding.data.setProperty(this.__dataId, property, value);
    }

    _loaded() {
        this._element.style.visibility = "";
        this._loaded = true;
    }
}