export class TranslationsManager {
    constructor() {
        this.dictionary = {};
    }

    dispose() {
        this.dictionary = null;
    }

    async add(obj, context) {
        flatten(context || "", obj, this.dictionary);
    }

    async delete(context) {

    }

    async parseElement(element) {

    }

    async parseAttribute(element, attribute) {

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
}

function flatten(prefix, obj, target) {
    if (typeof obj === "string") {
        if (prefix[0] === ".") {
            prefix = prefix.substring(1);
        }
        target[prefix] = obj;
    }
    else {
        const keys = Object.keys(obj);
        for (let key of keys) {
            flatten(`${prefix}.${key}`, obj[key], target);
        }
    }
}