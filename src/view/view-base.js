export class ViewBase {
    get element() {
        return this._element;
    }

    set element(newValue) {
        if (newValue != null) {
            newValue.style.display = "none";
        }

        this._element = newValue;
    }

    async connectedCallback() {
        this.isProxy = true;
        crsbinding.events.enableEvents(this);
        crsbinding.parseElement(this.element, this)
            .then(() => this._loaded())
            .catch(error => console.error(error));
    }

    async disconnectedCallback() {
        await crsbinding.releaseBinding(this.element);
        crsbinding.events.disableEvents(this);
    }

    _loaded() {
        crsbinding.updateUI(this);
        this.element.style.display = "block";
    }
}