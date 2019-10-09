export class BindableElement extends HTMLElement {
    get html() {
        return "";
    }

    async connectedCallback() {
        this.innerHTML = await fetch(this.html).then(result => result.text());
        crsbinding.enableEvents(this);
        await crsbinding.parseElement(this, this);
        this.dispatchEvent(new CustomEvent("ready"));
    }

    async disconnectedCallback() {
        crsbinding.disableEvents(this);
        await crsbinding.releaseBinding(this);
    }

    getProperty(prop) {
        return this[`_${prop}`] || this.getAttribute(prop);
    }

    setProperty(prop, value) {
        this[`_${prop}`] = value;
        this.notifyPropertyChanged(prop);
    }
}