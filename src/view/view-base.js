import {getProperty, setProperty} from "../binding/binding-helper.js";

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
        this._dataId = crsbinding.data.addObject(this.constructor.name);
        crsbinding.data.addContext(this._dataId, this);
        this.element = element;
    }

    async connectedCallback() {
        crsbinding.parsers.parseElement(this.element, this._dataId);

        this._loaded();
    }

    async disconnectedCallback() {
        crsbinding.observation.releaseBinding(this.element);
        crsbinding.utils.disposeProperties(this);
        this.element = null;
        crsbinding.data.removeObject(this._dataId);
    }

    getProperty(property) {
        return getProperty(this, property);
    }

    setProperty(property, value) {
        setProperty(this, property,  value);
    }

    _loaded() {
        this._element.style.visibility = "";
        this._loaded = true;
    }
}