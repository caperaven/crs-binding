import {getHtmlPath} from "./html-loader.js";

export class BindableElement extends HTMLElement {
    get shadowDom() {
        return false;
    }

    get hasOwnContext() {
        return true;
    }

    constructor() {
        super();

        if (this.shadowDom == true) {
            this.attachShadow({ mode: "open" });
        }

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
            const descriptor = Object.getOwnPropertyDescriptor(this, property);

            if (descriptor.configurable == true) {
                delete this[property];
            }
        }
    }

    async connectedCallback() {
        if (this._dataId == null || this.__isLoading == true) return;
        this.__isLoading = true;

        if(this.preLoad != null) {
            const setPropertyCallback = (path, value)=> {
                crsbinding.data.setProperty(this._dataId, path, value);
            };

            await this.preLoad(setPropertyCallback)
        }

        if (this.html != null) {
            const html = await crsbinding.templates.get(this.constructor.name, getHtmlPath(this));

            if (this.shadowRoot != null) {
                this.shadowRoot.innerHTML = html;
            }
            else {
                this.innerHTML = html;
            }

            if (this.onHTML != null) {
                await this.onHTML();
            }

            const path = crsbinding.utils.getPathOfFile(this.html);
            await crsbinding.parsers.parseElements(this.children, this._dataId, path ? {folder: path} : null);

            if (this.shadowRoot != null) {
                await crsbinding.parsers.parseElements(this.shadowRoot.children, this._dataId, path ? {folder: path} : null);
            }
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
            await this.load();
        }

        this.isReady = true;
        this.dispatchEvent(new CustomEvent("ready"));
        delete this.__isLoading;
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