export class BindableElement extends HTMLElement {
    get html() {
        return "";
    }

    async connectedCallback() {
        this.innerHTML = await fetch(this.html).then(result => result.text());
        crsbinding.events.enableEvents(this);
        await crsbinding.parsers.parseElement(this, this);
        this.dispatchEvent(new CustomEvent("ready"));
    }

    async disconnectedCallback() {
        crsbinding.events.disableEvents(this);
        await crsbinding.expression.release(this);
    }

    getProperty(prop) {
        return this[`_${prop}`] || this.getAttribute(prop);
    }

    setProperty(prop, value) {
        this[`_${prop}`] = value;
        crsbinding.events.notifyPropertyChanged(this, prop);
    }
}