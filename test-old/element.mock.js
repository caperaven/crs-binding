export class ElementMock {
    constructor(tagName, name) {
        this.attributes = [];
        this.queryResults = new Map();
        this.events = new Map();
        this.textContent = "";
        this.innerText = "";
        this.innerHTML = "";
        this.content = this;
        this.children = [];
        this.classList = new ClassList();
        this.dataset = {};

        this.nodeName = (tagName || "div").toUpperCase();
        this.name = name;
        this.style = {};
    }

    getAttribute(attr) {
        return this.attributes.find(item => item.name == attr);
    }

    setAttribute(attr, value) {
        const attrObj = {
            name: attr,
            value: value,
            ownerElement: this
        };

        this.attributes.push(attrObj);
    }

    removeAttribute(attr, value) {
        const attrObj = this.getAttribute(attr);
        const index = this.attributes.indexOf(attrObj);
        this.attributes.splice(index, 1);
    }

    querySelector(selector) {
        return this.queryResults.get(selector);
    }

    querySelectorAll(selector) {
        return [this.querySelector(selector)];
    }

    cloneNode() {
        return this;
    }

    appendChild(element) {
        this.children.push(element);
        return this;
    };

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index != -1) {
            this.children.splice(index, 1);
        }
        return this;
    }

    addEventListener(event, callback) {
        this.events.set(event, callback);
    }

    removeEventListener(event, callback) {
        this.events.delete(event);
    }

    insertBefore(element, oldElement) {

    }
}

class ClassList {
    get length() {
        return this.items.length;
    }

    constructor() {
        this.items = [];
    }

    add(item) {
        if (Array.isArray(item)) {
            for (let i of item) {
                this.items.push(i);
            }
        }
        this.items.push(item);
    }

    contains(item) {
        const result = this.items.find(cls => cls == item);
        return result != null;
    }

    remove(item) {
        const index = this.items.indexOf(item);
        if (index != -1) {
            this.items.splice(index, 1);
        }
    }

    item(index) {
        return this.items[index];
    }
}