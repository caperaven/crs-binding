export class PerspectiveElement extends HTMLElement {
    get hasOwnContext() {
        return true;
    }

    get context() {
        return this._dataId;
    }

    set context(newValue) {
        this._dataId = newValue;
    }

    get view() {
        return this._view;
    }

    set view(newValue) {
        this._view = newValue;
        this._loadView(newValue);
    }

    constructor() {
        super();

        const contextAttribute = this.getAttribute("context.one-way");
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
    }

    async connectedCallback() {
        if (this._dataId == null || this.__isLoading == true) return;
        this.__isLoading = true;

        this.store = this.dataset.store || this.constructor.name;
        const fragment = await crsbinding.templates.loadFromElement(this.store, this, this.html);
        this._currentView = fragment.name;
        this.appendChild(fragment);

        if(this.preLoad != null) {
            await this.preLoad();
        }

        requestAnimationFrame(() => {
            const name = this.getAttribute("name");
            if (name != null) {
                crsbinding.data.setName(this._dataId, name);
            }
        });

        if (this.load != null) {
            this.load();
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

    async _loadView(view) {
        if (this.__isLoading == true) return;

        crsbinding.observation.releaseChildBinding(this);
        this.innerHTML = "";
        const template = await crsbinding.templates.getById(this.store, view);
        this.appendChild(template);
        await crsbinding.parsers.parseElements(this.children, this._dataId, {folder: this.dataset.folder});
        this._currentView = view;
    }
}

customElements.define("perspective-element", PerspectiveElement);