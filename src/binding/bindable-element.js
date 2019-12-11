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

        if (this.observer == null) {
            this.observer.disconnect();
            this.attributesChangedHandler = null;
            this.observer = null;
        }

        crsbinding.observation.releaseBinding(this);
    }

    getProperty(prop) {
        return this[`_${prop}`] || this.getAttribute(prop);
    }

    setProperty(prop, value) {
        this[`_${prop}`] = value;
        crsbinding.events.notifyPropertyChanged(this, prop);
    }

    observeAttributes(attributes) {
        this.attributesChangedHandler = this.attributesChanged.bind(this);
        this.observer = new MutationObserver(this.attributesChangedHandler);
        this.observer.observe(this, {attributes: true, attributeFilter: attributes, attributeOldValue: true});
    }

    attributesChanged(mutationsList) {
        for(let mutation of mutationsList) {
            const attr = `${mutation.attributeName}AttributeChanged`;
            if (this[attr] != null) {
                this[attr](mutation.target[mutation.attributeName], mutation.oldValue);
            }
        }
    }
}