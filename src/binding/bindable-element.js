export class BindableElement extends HTMLElement {
    get hasOwnContext() {
        return true;
    }

    constructor() {
        super();

        if (this.hasOwnContext == true) {
            this._dataId = crsbinding.data.addObject(this.constructor.name);
            crsbinding.data.addContext(this._dataId, this);
        }

        crsbinding.dom.enableEvents(this);

        this.__properties = new Map();
    }

    dispose() {
        this._disposing = true;
        crsbinding.utils.forceClean(this);
        crsbinding.dom.disableEvents(this);

        const properties = Object.getOwnPropertyNames(this);
        for (let property of properties) {
            delete this[property];
        }
    }

    async connectedCallback() {
        if (this._dataId == null) return;

        if(this.preLoad != null) {
            const setPropertyCallback = (path, value)=> {
                crsbinding.data.setProperty(this._dataId, path, value);
            };

            await this.preLoad(setPropertyCallback)
        }

        if (this.html != null) {
            this.innerHTML = await fetch(this.html).then(result => result.text());
            await crsbinding.parsers.parseElements(this.children, this._dataId);
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
    }

    getProperty(property) {
        return crsbinding.data.getProperty(this, property);
    }

    setProperty(property, value, once = false) {
        if (this.isReady != true && once === false && this.__properties) {
            return this.__properties.set(property, value);
        }

        crsbinding.data.setProperty(this, property, value);
    }
}