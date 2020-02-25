import {BindableElement} from "../../src/binding/bindable-element.js";

export class TextProperties extends BindableElement {

    static get properties() {
        return ["model"]
    }

    get model() {
        return this.getProperty("model");
    }

    set model(newValue) {
        this.setProperty("model", newValue);
    }

    get html() {
        return import.meta.url.replace(".js", ".html");
    }

    async connectedCallback() {
        super.connectedCallback();

        this._clickHandler = this._click.bind(this);

        await this._initEventListeners();
        this.observeAttributes(["model"]);
    }

    async disconnectedCallback() {
        await this._cleanUp();
        crsbinding.observation.releaseObserved(this.model);
        delete this.model;
    }

    async _initEventListeners() {
        this.addEventListener('click', this._clickHandler);
    }

    async _cleanUp() {
        this.removeEventListener("click", this._clickHandler);
        this._clickHandler = null;
    }

    _click(e) {
        if (this[`_${e.target.dataset.call}`] != null) {
            this[`_${e.target.dataset.call}`](e);
        }
    }
    
    modelAttributeChanged(args) {
        console.log(args);
    }
}

customElements.define('text-properties', TextProperties);