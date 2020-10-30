import {relativePathFrom} from "../lib/utils.js";

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
        if(this.preLoad != null) {
            const setPropertyCallback = (path, value)=> {
                crsbinding.data.setProperty(this._dataId, path, value);
            };

            await this.preLoad(setPropertyCallback);
        }

        const path = crsbinding.utils.getPathOfFile(this.html);

        await crsbinding.parsers.parseElement(this.element, this._dataId, path ? {folder: path} : null);
        this.load();
    }

    async disconnectedCallback() {
        crsbinding.utils.forceClean(this._dataId);
        crsbinding.observation.releaseBinding(this.element);
        crsbinding.utils.disposeProperties(this);
        this.element = null;
    }

    getProperty(property) {
        return crsbinding.data.getProperty(this, property);
    }

    setProperty(property, value) {
        crsbinding.data.setProperty(this, property, value);
    }

    load() {
        this._element.style.visibility = "";
        this._loaded = true;
    }
}