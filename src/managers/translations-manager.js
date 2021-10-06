import {flattenPropertyPath} from "./../lib/utils.js";

export class TranslationsManager {
    constructor() {
        this.dictionary = {};
    }

    dispose() {
        this.dictionary = null;
    }

    async add(obj, context) {
        flattenPropertyPath(context || "", obj, this.dictionary);
    }

    async delete(context) {
        const filterKey = `${context}.`;
        const keys = Object.keys(this.dictionary).filter(item => item.indexOf(filterKey) === 0);
        for (let key of keys) {
            delete this.dictionary[key];
        }
    }

    async parseElement(element) {
        if (element.textContent.indexOf("&{") != -1) {
            element.textContent = await this.get_with_markup(element.textContent.trim());
        }

        for (let attribute of element.attributes) {
            await this.parseAttribute(attribute);
        }

        for (let child of element.children) {
            await this.parseElement(child);
        }
    }

    async parseAttribute(attribute) {
        if (attribute.nodeValue.indexOf("&{") !== -1) {
            attribute.nodeValue = await this.get_with_markup(attribute.nodeValue);
        }
    }

    async get(key) {
        let result = this.dictionary[key];

        if(result != null) {
            return result;
        }

        result = this.fetch == null ? null : await this.fetch(key);
        if (result != null) {
            this.dictionary[key] = result;
        }

        return result;
    }

    async get_with_markup(key) {
        key = key.split("&{").join("").split("}").join("");
        return await this.get(key);
    }
}