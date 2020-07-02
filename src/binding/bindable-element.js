import {getProperty, setProperty} from "./binding-helper.js";

export class BindableElement extends HTMLElement {
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

            await this.preLoad(setPropertyCallback)
        }

        if (this.html != null) {
            this.innerHTML = await fetch(this.html).then(result => result.text());
            crsbinding.parsers.parseElements(this.children, this._dataId);
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

        if (this.load != null) {
            this.load();
        }

        // JHR: this is for debugging.
        // this.dataset.uid = this._dataId;
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
        if (this.isReady != true && once === false) {
            return this.__properties.set(property, value);
        }

        setProperty(this, property, value);
    }
}