export class BindableElement extends HTMLElement {
    constructor() {
        super();
        crsbinding.dom.enableEvents(this);
    }

    dispose() {
        this._disposing = true;
        crsbinding.dom.disableEvents(this);
    }

    async connectedCallback() {
        if (this.html != null) {
            this.innerHTML = await fetch(this.html).then(result => result.text());
            crsbinding.parsers.parseElements(this.children, this);
        }

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

    getProperty(prop) {
    }

    setProperty(prop, value, forceProxy = false) {
    }
}