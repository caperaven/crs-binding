export class ElementMock {
    constructor(tagName, name) {
        this.attributes = new Map();
        this.queryResults = new Map();
        this.events = new Map();
        this.innerText = "";
        this.innerHTML = "";
        this.content = this;
        this.children = [];

        this.nodeName = (tagName || "div").toUpperCase();
        this.name = name;
        this.style = {};
    }

    getAttribute(attr) {
        return this.attributes.get(attr);
    }

    setAttribute(attr, value) {
        this.attributes.set(attr, value);
    }

    removeAttribute(attr, value) {
        if (this.attributes.has(attr)) {
            this.attributes.delete(attr);
        }
    }

    querySelector(selector) {
        return this.queryResults.get(selector);
    }

    cloneNode() {
        return this;
    }

    appendChild(element) {
        this.children.push(element);
    };

    removeChild(child) {
        const index = this.children.indexOf(child);
        if (index != -1) {
            this.children.splice(index, 1);
        }
    }

    addEventListener(event, callback) {
        this.events.set(event, callback);
    }

    removeEventListener(event, callback) {
        this.events.delete(event);
    }
}
