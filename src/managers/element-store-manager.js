export class ElementStoreManager {
    constructor() {
        this._items = new Map();
    }

    dispose() {
        this._items.clear();
        this._items = null;
    }

    register(id, template, cacheInnerHTML = false, measure = false) {
        const instance = template.content.cloneNode(true);

        const result = {
            elements: [instance],
            template: template
        };

        if (cacheInnerHTML === true) {
            result.innerHTML = crsbinding.utils.fragmentToText(instance);
        }

        if (measure === true) {
            crsbinding.measure(instance).then(size => result.size = size);
        }

        this._items.set(id, result);
    }

    _getItemElement(item) {
        return item.elements.pop() || item.template.content.cloneNode(true);
    }

    getElement(id) {
        const item = this._items.get(id);
        return this._getItemElement(item);
    }

    getElements(id, quantity) {
        const item = this._items.get(id);
        const fragment = document.createDocumentFragment();

        for (let i = 0; i < quantity; i++) {
            fragment.appendChild(this._getItemElement(item));
        }

        return fragment;
    }

    getBoundElement(id, context) {
        const item = this._items.get(id);
        const result = this._getItemElement(item);
        crsbinding.parsers.parseElement(result, context);
        return result;
    }

    returnElements(id, elements, restore = true) {
        const item = this._items.get(id);

        for (let element of elements) {
            if (restore == true) {
                element.innerHTML = item.innerHTML;
            }

            item.elements.push(element);
        }
    }

    unregister(id) {
        const item = this._items.get(id);
        if (item != null) {
            this._items.delete(id);
            item.elements.length = 0;
            item.template = null;
            item.innerHTML = null;
        }
    }
}