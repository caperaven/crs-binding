import {BindableElement} from "./../../../src/binding/bindable-element.js";

export class Pages extends BindableElement {
    get html() {
        return null;
    }

    get context() {
        return this.getProperty("context");
    }

    set context(newValue) {
        this.setProperty("context", newValue);
    }

    async connectedCallback() {
        this._templates = [];
        super.connectedCallback();
    }

    async disconnectedCallback() {
        const element = this.querySelector("[role='tablist']");
        element.removeEventListener("click", clickHandler);
        const clickHandler = null;

        delete this._panel;

        this._templates.forEach(id => crsbinding.elementStoreManager.unregister(id));
        super.disconnectedCallback();
    }

    load() {
        this._panel = this.querySelector("[role='tabpanel']");
        const elements = this.querySelectorAll("template");
        this._firstPage = elements[0].id;

        for (let element of elements) {
            element.parentElement.removeChild(element);
            const id = `${this.id}_${element.id}`;
            this._templates.push(id);
            crsbinding.elementStoreManager.register(id, element);
        }

        // JHR: we should add this to a register event function instead
        const element = this.querySelector("[role='tablist']");
        const clickHandler = this._click.bind(this);
        element.addEventListener("click", clickHandler);
    }

    contextChanged(newValue) {
        this._show(this._firstPage);
    }

    _click(event) {
        const target = event.target.dataset.template;
        target && this._show(target);
    }

    _show(target) {
        if (this._panel.children.length > 0) {
            const oldChild = this._panel.children[0];
            this._panel.removeChild(oldChild);
            crsbinding.idleTaskManager.add(() => {
                crsbinding.observation.releaseBinding(oldChild);
            })
        };

        const id = `${this.id}_${target}`;
        const element = crsbinding.elementStoreManager.getBoundElement(id, this.context);

        const child = document.createElement("div");
        child.id = target;
        child.appendChild(element);

        crsbinding.parsers.parseElement(child, this.context);

        this._panel.appendChild(child);
    }
}

customElements.define("crs-pages", Pages);