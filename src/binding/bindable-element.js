export class BindableElement extends HTMLElement {
    get html() {
        return "";
    }

    async connectedCallback() {
        this.innerHTML = await fetch(this.html).then(result => result.text());
        crsbinding.enableEvents(this);
        crsbinding.parseElement(this, this);
    }

    async disconnectedCallback() {
        crsbinding.disableEvents(this);
        crsbinding.releaseBinding(this);
    }

    getProperty(prop) {
        return this[`_${prop}`] || this.getAttribute(prop);
    }

    setProperty(prop, value) {
        this[`_prop`] = value;
        this.notifyPropertyChanged(prop);
    }
}