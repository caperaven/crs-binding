export class PerspectiveElement extends HTMLElement {
    get hasOwnContext() {
        return true;
    }

    get ctx() {
        return this._dataId;
    }

    set ctx(newValue) {
        this._dataId = newValue;

        if (newValue != null) {
            const name = this.getAttribute("name");

            if (name != null) {
                crsbinding.data.setName(this._dataId, name);
            }

            this._loadView();
        }
    }

    get view() {
        return this._view;
    }

    set view(newValue) {
        if (this._view != newValue) {
            this._view = newValue;
            this._loadView();
        }
    }

    constructor() {
        super();
        const contextAttribute = this.getAttribute("ctx.one-way") || this.getAttribute("ctx.once");
        if (this.hasOwnContext == true && contextAttribute == null) {
            this._dataId = crsbinding.data.addObject(this.constructor.name);
            crsbinding.data.addContext(this._dataId, this);
        }

        crsbinding.dom.enableEvents(this);
    }

    dispose() {
        this._disposing = true;
        crsbinding.utils.forceClean(this);
        crsbinding.dom.disableEvents(this);
        crsbinding.templates.unload(this.store);
    }

    async connectedCallback() {
        await this._initialize();
    }

    async _initialize() {
        // 1. I am busy loading, if the context or view changes just stop it.
        this.__isLoading = true;
        this.store = this.dataset.store || this.constructor.name;

        // 2. Load the HTML of this element as a store item in the store defined.
        await crsbinding.templates.loadFromElement(this.store, this, this.html, async fragment => {
            // 3. Once the store has been created, perform initialization functions
            if(this.preLoad != null) {
                await this.preLoad();
            }

            if (this.load != null) {
                this.load();
            }

            this.__isLoading = false;
            this.view = fragment.name;
        })
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

    async _loadView() {
        if (this.__isLoading == true) return;

        if (this._view == null || this._dataId == null) {
            return;
        }

        crsbinding.observation.releaseChildBinding(this);
        this.innerHTML = "";

        const template = await crsbinding.templates.getById(this.store, this._view);
        this.appendChild(template);
        await crsbinding.parsers.parseElements(this.children, this._dataId, {folder: this.dataset.folder});

        requestAnimationFrame(() => {
            this.dataset.view = this._view;
            this.dispatchEvent(new CustomEvent("view-loaded"));
        })
    }
}

customElements.define("perspective-element", PerspectiveElement);