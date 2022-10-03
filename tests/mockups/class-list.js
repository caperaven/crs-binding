export class ClassList {
    #items;
    
    get length() {
        return this.#items.length;
    }

    get values() {
        return this.#items;
    }

    constructor() {
        this.#items = [];
    }

    add(item) {
        if (Array.isArray(item)) {
            for (let i of item) {
                this.#items.push(i);
            }
        }
        this.#items.push(item);
    }

    contains(item) {
        const result = this.#items.find(cls => cls == item);
        return result != null;
    }

    remove(item) {
        const index = this.#items.indexOf(item);
        if (index != -1) {
            this.#items.splice(index, 1);
        }
    }

    item(index) {
        return this.#items[index];
    }
}