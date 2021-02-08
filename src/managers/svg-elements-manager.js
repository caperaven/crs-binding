export class SvgElementsManager {
    constructor() {
        this._tagMap = new Map();
        this._queue = [];
        this._observed = new Map();
    }

    dispose() {
        this._tagMap.clear();
        this._tagMap = null;
    }

    define(tagName, proto) {
        if (this._tagMap.has(tagName) == false) {
            this._tagMap.set(tagName, proto);
        }

        this._processElements(tagName);
    }

    parse(svgElement) {
        const elements = svgElement.querySelectorAll("[is]");
        if (elements.length == 0) return;

        this._observe(svgElement);

        for (let element of elements) {
            const cName = element.getAttribute("is");

            if (this._tagMap.has(cName) == false) {
                this._queue.push({
                    parent: svgElement,
                    cName: cName,
                    el: element
                });
            }
            else {
                this._createComponent({
                    parent: svgElement,
                    cName: cName,
                    el: element
                });
            }
        }
    }

    removeComponent(element) {
        let svg = null;
        let parent = element;
        let count = 0;
        while (svg == null|| count == 100) {
            count++;
            if (parent.nodeName.toLocaleString() == "svg") {
                svg = parent;
                break;
            }
            parent = parent.parentElement;
        }

        this._removeComponentFromSvg(svg, element);
    }

    _removeComponentFromSvg(svg, element) {
        const def = this._observed.get(svg);
        if (def == null) return;

        let component = def.children.get(element);
        if (component == null) return;

        component.disconnectedCallback();
        component.dispose();
        def.children.delete(element);
        element.parentElement.removeChild(element);
        component = null;
        element = null;
    }

    release(svgElement) {
        if (this._observed.size == 0) return;

        const elements = svgElement.querySelectorAll("[is]");
        for (let element of elements) {
            this._removeComponentFromSvg(svgElement, element);
        }
        const def = this._observed.get(svgElement);
        def.children.clear();
        def.children = null;
        this._observed.delete(svgElement);

        //JHR: todo, clear queue
    }

    _observe(element) {
        if (this._observed.has(element)) return;

        const detail = {
            children: new Map()
        };

        this._observed.set(element, detail);
    }

    _createComponent(def) {
        const proto = this._tagMap.get(def.cName);
        const svgDef = this._observed.get(def.parent);

        if (svgDef.children.has(def.el) == false) {
            const instance = new proto(def.el);
            svgDef.children.set(def.el, instance);
            instance.connectedCallback();
        }

        delete def.parent;
        delete def.cName;
        delete def.el;
    }

    _processElements(component) {
        const definitions = this._queue.filter(el => el.cName == component);
        for (let def of definitions) {
            this._createComponent(def);
            this._queue.splice(this._queue.indexOf(def), 1);
        }
    }
}