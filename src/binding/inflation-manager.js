export class InflationManager {
    constructor() {
        this._items = new Map();
    }

    dispose() {
        this._items.clear();
        this._items = null;
    }

    /**
     * This function registers a template for creating elements using the get function
     * @param id
     * @param template
     */
    register(id, template) {
        const result = generateCodeFor(template);

        this._items.set(id, {
            template: template,
            inflate: result.inflate,
            deflate: result.deflate
        })
    }

    /**
     * Remove the template from the inflation manager as we are longer going to use it anymore
     * @param id
     */
    unregister(id) {
        const item = this._items.get(id);
        if (item != null) {
            item.template = null;
            item.inflate = null;
            item.defaulte = null;
            this._items.delete(id);
        }
    }

    /**
     * Get a element or elements and inflate it with the data
     * @param id
     * @param data
     */
    get(id, data) {
        const item = this._items.get(id);
        if (item == null) return null;

        const fragment = document.createDocumentFragment();

        for (let d of data) {
            const element = item.template.content.cloneNode(true);
            this.inflate(id, element, d, item.inflate);
            fragment.appendChild(element);
        }

        return fragment;
    }

    /**
     * Inflate a element
     * @param id
     * @param element
     * @param data
     */
    inflate(id, element, data, inflate = null) {
        const fn = inflate || this._items.get(id).inflate;
        fn(element, data);
    }

    /**
     * Deflate a element
     * @param id
     * @param element
     */
    deflate(id, elements) {
        const fn = this._items.get(id).deflate;

        if (Array.isArray(elements)) {
            for (let element of elements) {
                fn(element)
            }
        }
        else {
            fn(elements);
        }
    }
}

function generateCodeFor(template) {
    let inflateSrc = "";
    let deflateSrc = "";

    return {
        inflate: inflateSrc,
        deflate: deflateSrc
    }
}