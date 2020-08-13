function getProperty(obj, property) {
    const field = `_${property}`;
    if (obj[field] != null) {
        return obj[field];
    }

    return crsbinding.data.getValue(obj._dataId, property);
}

function setProperty(obj, property, value) {
    let oldValue = getProperty(obj, property);

    if (Array.isArray(oldValue)) {
        crsbinding.data.array(obj, property).splice(0, oldValue.length);
    }
    if (value && value.__uid != null) {
        oldValue && crsbinding.data.unlinkArrayItem(oldValue);
    }

    crsbinding.data.setProperty(obj._dataId, property, value);

    if (Array.isArray(value)) {
        obj[`_${property}`] = crsbinding.data.array(obj._dataId, property);
    }

    if (value && value.__uid) {
        crsbinding.data.linkToArrayItem(obj._dataId, property, value.__uid);
    }
}

class ViewBase {
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

        crsbinding.parsers.parseElement(this.element, this._dataId);
        this.load();
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

    load() {
        this._element.style.visibility = "";
        this._loaded = true;
    }
}

export { ViewBase };
