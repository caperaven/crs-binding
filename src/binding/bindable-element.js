export class BindableElement extends HTMLElement {
    constructor() {
        super();
        this._dataId = crsbinding.data.addObject(this.constructor.name);
        crsbinding.dom.enableEvents(this);

        this.__properties = new Map();
    }

    dispose() {
        this._disposing = true;
        crsbinding.dom.disableEvents(this);
    }

    async connectedCallback() {
        if (this.html != null) {
            this.innerHTML = await fetch(this.html).then(result => result.text());
            crsbinding.parsers.parseElements(this.children, this._dataId);
        }

        if (this.load != null) {
            this.load();
        }

        this.isReady = true;
        this.dispatchEvent(new CustomEvent("ready"));

        requestAnimationFrame(() => {
            const name = this.getAttribute("name");
            if (name != null) {
                crsbinding.data.setName(this._dataId, name);
            }
        });

        this.__properties.forEach((value, key) => crsbinding.data.setProperty(this._dataId, key, value));
        this.__properties.clear();
        delete this.__properties;
    }

    async disconnectedCallback() {
        this.dispose();

        crsbinding.utils.disposeProperties(this);
        crsbinding.observation.releaseBinding(this);
    }

    getProperty(property) {
        return crsbinding.data.getValue(this._dataId, property);
    }

    setProperty(property, value) {
        if (this.isReady != true) {
            return this.__properties.set(property, value);
        }

        crsbinding.data.setProperty(this._dataId, property, value);
    }
}