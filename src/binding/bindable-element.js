export class BindableElement extends HTMLElement {
    constructor() {
        super();
        crsbinding._objStore.add(this);
        crsbinding.dom.enableEvents(this);
    }

    dispose() {
        this._disposing = true;

        crsbinding._objStore.remove(this);
        crsbinding.dom.disableEvents(this);
    }

    async connectedCallback() {
        if (this.html != null) {
            this.innerHTML = await fetch(this.html).then(result => result.text());
            crsbinding.parsers.parseElements(this.children, this);
            crsbinding.expression.updateUI(this);
        }

        if (this.load != null) {
            this.load();
        }

        this.dispatchEvent(new CustomEvent("ready"));
    }

    async disconnectedCallback() {
        this.dispose();

        if (this.observer != null) {
            this.observer.disconnect();
            this.attributesChangedHandler = null;
            this.observer = null;
        }

        crsbinding.observation.releaseBinding(this);
    }

    getProperty(prop) {
        let result = this[`_${prop}`];
        if (result == null && this.getAttribute != null) {
            result = this.getAttribute(prop);
        }
        return  result;
    }

    setProperty(prop, value, forceProxy = false) {
        const property = this[`${prop}`];

        if (property != null && typeof property == "object") {
            const elEvents = property.__elEvents || property.__events;
            delete property.__elEvents;

            if (value == undefined) {
                value = {};
            }

            if (value != null) {
                value.__elEvents = elEvents;
            }
        }

        if (forceProxy === true && value != null && value.__isProxy !== true) {
            value = crsbinding.observation.observe(value, this[`_${prop}`]);
        }

        this[`_${prop}`] = value;

        crsbinding.events.notifyPropertyChanged(this, prop);
        this.dispatchEvent(new CustomEvent(`${prop}Change`));
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