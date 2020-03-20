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

        this.isReady = true;
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
        if (this.isReady != true && value === undefined) return;

        // 1 Get the old value
        const oldValue = this[`${prop}`];

        if (typeof value == "object") {
            // 2. During initialization the old value is a object created during element processing.
            // Due to events in the providers it may try to override this with a undefined as the data model is not there yet.
            // Ignore that.
            // If you do want to make this "empty" set it to null not undefined
            if (oldValue != null && oldValue.__isProxy == true && value === undefined) return;

            // 3. Do you want to object to always be a proxy event when you don't set it up to be like that.
            if (forceProxy === true && value != null && value.__isProxy !== true) {
                value = crsbinding.observation.observe(value, this[`_${prop}`]);
            }

            // 4. If the old and new value exist share the references between them so that object sharing can happen
            // When working with arrays, you don't want to use the bid as the reference is set on the array itself.
            // In those cases we use the pbid. this stands for parent binding id.
            if (value && oldValue) {
                crsbinding._objStore.setReference(value, oldValue);
            }
        }

        // 5. Set the actual value
        this[`_${prop}`] = value;

        // 6. Notify that the change has taken place.
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