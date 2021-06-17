export class ElementStoreManager {
    constructor() {
        this._items = new Map();
    }

    dispose() {
        this._items.clear();
        this._items = null;
    }

    register(id, template, measure = false) {
        const instance = crsbinding.utils.cloneTemplate(template);

        const result = {
            elements: [instance],
            template: template
        };

        if (measure === true) {
            crsbinding.utils.measureElement(instance).then(size => result.size = size);
        }

        this._items.set(id, result);
    }

    getItemElement(item) {
        return item.elements.pop() || crsbinding.utils.cloneTemplate(item.template);
    }

    getElement(id) {
        const item = this._items.get(id);
        return this.getItemElement(item);
    }

    getElements(id, quantity) {
        const item = this._items.get(id);
        const fragment = document.createDocumentFragment();

        while(fragment.children.length < quantity) {
            fragment.appendChild(this.getItemElement(item));
        }

        return fragment;
    }

    async getBoundElement(id, context) {
        const item = this._items.get(id);
        const result = this.getItemElement(item);
        await crsbinding.parsers.parseElement(result, context);
        return result;
    }

    returnElements(id, elements) {
        const item = this._items.get(id);

        for (let element of elements) {
            item.elements.push(element);
        }
    }

    unregister(id) {
        const item = this._items.get(id);
        if (item != null) {
            this._items.delete(id);
            item.elements.length = 0;
            item.template = null;
        }
    }
}