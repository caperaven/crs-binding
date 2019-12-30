export class ViewBase {
    static get properties() {
        return ["title"]
    }

    get title() {
        return this._title;
    }

    set title(newValue) {
        this._title = newValue;
    }

    get element() {
        return this._element;
    }

    set element(newValue) {
        if (newValue != null) {
            newValue.style.display = "none";
        }

        this._element = newValue;
    }

    constructor(element) {
        this.element = element;
    }

    async connectedCallback() {
        this.isProxy = true;
        crsbinding.events.enableEvents(this);
        crsbinding.parsers.parseElement(this.element, this)
            .then(() => this._loaded())
            .catch(error => console.error(error));
    }

    async disconnectedCallback() {
        await crsbinding.observation.releaseBinding(this.element);
        crsbinding.events.disableEvents(this);
    }

    getProperty(prop) {
        let result = this[`_${prop}`];
        if (result == null && this.getAttribute != null) {
            result = this.getAttribute(prop);
        }
        return  result;
    }

    setProperty(prop, value) {
        this[`_${prop}`] = value;
        crsbinding.events.notifyPropertyChanged(this, prop);
    }

    _loaded() {
        crsbinding.expression.updateUI(this);
        this.element.style.display = "block";
    }
}