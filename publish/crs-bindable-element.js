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

class BindableElement extends HTMLElement {
    constructor() {
        super();
        this._dataId = crsbinding.data.addObject(this.constructor.name);

        crsbinding.data.addContext(this._dataId, this);
        crsbinding.dom.enableEvents(this);

        this.__properties = new Map();
    }

    dispose() {
        this._disposing = true;
        crsbinding.dom.disableEvents(this);
    }

    async connectedCallback() {
        if(this.preLoad != null) {
            const setPropertyCallback = (path, value)=> {
                crsbinding.data.setProperty(this._dataId, path, value);
            };

            await this.preLoad(setPropertyCallback);
        }

        if (this.html != null) {
            this.innerHTML = await fetch(this.html).then(result => result.text());
            crsbinding.parsers.parseElements(this.children, this._dataId);
        }

        requestAnimationFrame(() => {
            const name = this.getAttribute("name");
            if (name != null) {
                crsbinding.data.setName(this._dataId, name);
            }
        });

        this.__properties.forEach((value, key) => crsbinding.data.setProperty(this._dataId, key, value));
        this.__properties.clear();
        delete this.__properties;

        if (this.load != null) {
            this.load();
        }

        this.isReady = true;
        this.dispatchEvent(new CustomEvent("ready"));
    }

    async disconnectedCallback() {
        this.dispose();

        crsbinding.utils.disposeProperties(this);
        crsbinding.observation.releaseBinding(this);
        crsbinding.data.removeObject(this._dataId);
    }

    getProperty(property) {
        return getProperty(this, property);
    }

    setProperty(property, value, once = false) {
        if (this.isReady != true && once === false && this.__properties) {
            return this.__properties.set(property, value);
        }

        setProperty(this, property, value);
    }
}

export { BindableElement };
