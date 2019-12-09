export class BindableElement extends HTMLElement {
    get html() {
        return "";
    }

    constructor() {
        super();
        crsbinding.events.enableEvents(this);
    }

    dispose() {
        crsbinding.events.disableEvents(this);
    }

    async connectedCallback() {
        this.innerHTML = await fetch(this.html).then(result => result.text());
        await crsbinding.parsers.parseElements(this.children, this);
        crsbinding.expression.updateUI(this);
        this.dispatchEvent(new CustomEvent("ready"));
    }

    async disconnectedCallback() {
        this.dispose();
        crsbinding.observation.releaseBinding(this);
    }

    getProperty(prop) {
        return this[`_${prop}`] || this.getAttribute(prop);
    }

    setProperty(prop, value) {
        this[`_${prop}`] = value;
        crsbinding.events.notifyPropertyChanged(this, prop);
    }
}