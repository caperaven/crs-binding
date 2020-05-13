import {ProviderBase} from "./provider-base.js";

export class RepeatBaseProvider extends ProviderBase {
    dispose() {
        this._singular = null;
        this._plural = null;
        this._container = null;
        this._collectionChangedHandler = null;

        this.positionStruct.addAction = null;
        this.positionStruct.removeAction = null;
        this.positionStruct = null;

        super.dispose();
    }

    async initialize() {
        // 1. get the container and remove the template
        this._container = this._element.parentElement;
        this._shouldClearAll = this._container.children.length == 1;
        this._determineInsertParameters();

        // 2. get the properties to work with and build the for loop
        const parts = this._value.split("of");
        this._singular = parts[0].trim();
        this._plural = parts[1].trim();

        // 3. listen to the collection property on the context changing
        this._collectionChangedHandler = this._collectionChanged.bind(this);
        this.listenOnPath(this._plural, this._collectionChangedHandler);
    }

    async _collectionChanged(context, newValue) {
        if (newValue == null) return this._clear();
        this._renderItems(newValue);
    }

    /**
     * Determine what must happen when inserting or deleting the collection.
     * Where must it go.
     * @private
     */
    _determineInsertParameters() {
        const nSibling = this._element.nextElementSibling;
        const pSibling = this._element.previousElementSibling;

        this.positionStruct = {
            startIndex: Array.from(this._container.children).indexOf(this._element),
            addAction: nSibling != null ? this._insertBefore.bind(nSibling) : this._appendItems.bind(this._element),
            removeAction: () => this._removeBetween.call(this._element, pSibling, nSibling)
        }
    }

    /**
     * Append the items to the parent of the element defined as this
     * @param element
     * @private
     */
    _appendItems(element) {
        this.parentElement.appendChild(element);
    }

    /**
     * Insert the items before the element defined as this
     * @param element
     * @private
     */
    _insertBefore(element) {
        this.parentElement.insertBefore(element, this);
    }

    /**
     * Remove all elements between the two elements defined in the parameters.
     * This is bound to the _element property
     * @param beforeElement
     * @param afterElement
     * @private
     */
    _removeBetween(beforeElement, afterElement) {
        // 1. get the bounds to operate in
        const elements = Array.from(this.parentElement.children);
        let startIndex = elements.indexOf(beforeElement);
        let endIndex = elements.indexOf(afterElement);

        if (startIndex == -1) startIndex = 0;
        if (endIndex == -1) endIndex = elements.length;

        // 2. get the elements to remove
        const elementsToRemove = [];
        for (let i = startIndex + 1; i < endIndex; i++) {
            if (elements[i].nodeName != "TEMPLATE") {
                elementsToRemove.push(elements[i]);
            }
        }

        // 3. remove the elements earmarked for removal
        for (let element of elementsToRemove) {
            element.parentElement.removeChild(element);
        }
    }

    _clear() {
        if (this._shouldClearAll == true) {
            this._clearAll();
        }
        else {
            this._clearPartial();
        }
    }

    _clearAll() {
        const elements = Array.from(this._container.children).filter(el => el.nodeName != "TEMPLATE");

        for (let child of elements) {
            child.parentElement.removeChild(child);
            crsbinding.observation.releaseBinding(child);
        }
    }

    _clearPartial() {
        this.positionStruct.removeAction();
    }

    async _renderItems() {
        this._clear();
    }

    createElement(item, arrayId) {
        const id = crsbinding.data.createReferenceTo(this._context, `${this._context}-array-item-${arrayId}`, this._plural, arrayId);
        const element = this._element.content.cloneNode(true);
        crsbinding.parsers.parseElement(element, id, this._singular, this._context);

        item.__uid = id;

        for (let child of element.children) {
            child.dataset.uid = id;
        }

        return element;
    }
}