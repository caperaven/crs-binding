export class ViewBase {
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
        this.__isProxy = true;
        crsbinding.events.enableEvents(this);
        crsbinding.parsers.parseElement(this.element, this);
        this._loaded();
    }

    async disconnectedCallback() {
        crsbinding.observation.releaseBinding(this.element);
        crsbinding.events.disableEvents(this);
        this.element = null;
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
        // this is a proxy and the notification of property change happens in the observer
    }

    _loaded() {
        crsbinding.expression.updateUI(this);
        this.element.style.display = "block";
    }
}