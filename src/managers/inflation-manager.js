import {forStatementParts} from "./../lib/utils.js";

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
    register(id, template, ctxName = "context", measure = false) {
        template = template.cloneNode(true);
        const generator = new InflationCodeGenerator(ctxName, id);
        const result = generator.generateCodeFor(template);
        const templates = generator.templateKeys;
        generator.dispose();

        crsbinding.elementStoreManager.register(id, template, measure);

        this._items.set(id, {
            id: id,
            childCount: result.childCount,
            inflate: result.inflate,
            deflate: result.deflate,
            templates: templates
        })
    }

    /**
     * Remove the template from the inflation manager as we are longer going to use it anymore
     * @param id
     */
    unregister(id) {
        const item = this._items.get(id);
        if (item != null) {
            item.inflate = null;
            item.defaulte = null;

            if (item.templates != null) {
                item.templates.forEach(tplId => this.unregister(tplId));
            }

            this._items.delete(id);
        }
        crsbinding.elementStoreManager.unregister(id);
    }

    /**
     * Get a element or elements and inflate it with the data
     * @param id
     * @param data
     */
    get(id, data, elements) {
        const item = this._items.get(id);
        if (item == null) return null;

        if (elements != null) {
            return this._getWithElements(item, data, elements);
        }

        const length = Array.isArray(data) ? data.length * item.childCount : 1;
        const fragment = crsbinding.elementStoreManager.getElements(id, length);
        this._inflateElements(item, fragment, data);
        return fragment;
    }

    /**
     * Calculate the width of the element
     * @param item
     * @param data
     * @param elements
     * @returns {DocumentFragment}
     * @private
     */
    _getWithElements(item, data, elements) {
        const diff = elements.length - data.length;
        const fragment = document.createDocumentFragment();

        if (diff > 0) {
            for (let i = 0; i < diff; i++) {
                const removed = elements.pop();
                removed.parentElement.removeChild(removed);
            }
        }
        else if (diff < 0) {
            for (let i = 0; i > diff; i--) {
                fragment.appendChild(crsbinding.elementStoreManager.getElement(item.id));
            }
        }

        const processArray = [...elements, ...Array.from(fragment.children)];
        this._inflateElements(item, processArray, data);

        return fragment;
    }

    /**
     * This function inflates a single item template with a single item data object
     * @param item
     * @param fragment
     * @param data
     * @private
     */
    _inflateSingleElement(item, fragment, data) {
        this.inflate(item.id, item.childCount == 1 ? fragment.children[0] : Array.from(fragment.children), data, item.inflate);
    }

    /**
     * Inflate a template that has only a single child
     * @param item
     * @param fragment
     * @param data
     * @private
     */
    _inflateSingleChildFragment(item, fragment, data) {
        const isArray = Array.isArray(fragment);

        data = Array.isArray(data) ? data : [data];

        for (let i = 0; i < data.length; i++) {
            const child = isArray ? fragment[i] : fragment.children[i];
            this.inflate(item.id, child, data[i], item.inflate);
            child.__inflated = true;

            const attrAttributes = Array.from(child.attributes).filter(attr => attr.name.indexOf(".attr") != -1);
            for (let attr of attrAttributes) {
                child.removeAttribute(attr.name);
            }
        }
    }

    /**
     * Inflate a template that has multiple children for multiple records but no structure element
     * @param item
     * @param fragment
     * @param data
     * @private
     */
    _inflateMultiChildFragment(item, fragment, data) {
        const srcElements = Array.from(fragment.children);

        let index = 0;

        for (let i = 0; i < data.length; i++) {
            const elements = srcElements.slice(index, index + item.childCount);
            this.inflate(item.id, elements, data[i], item.inflate, false);
            index += item.childCount;
        }

        srcElements.forEach(child => {
            child.__inflated = true;

            const attrAttributes = Array.from(child.attributes).filter(attr => attr.name.indexOf(".attr") != -1);
            for (let attr of attrAttributes) {
                child.removeAttribute(attr.name);
            }
        });

        srcElements.filter(el => el.getAttribute("remove") == "true").forEach(rem => rem.parentNode.removeChild(rem));
    }

    /**
     * Inflation of element entry point that calls the appropriate functions depending on the work required.
     * @param item
     * @param fragment
     * @param data
     * @private
     */
    _inflateElements(item, fragment, data) {
        if (Array.isArray(data) == false) {
            this._inflateSingleElement(item, fragment, data)
        }
        else if (item.childCount == 1) {
            this._inflateSingleChildFragment(item, fragment, data);
        }
        else {
            this._inflateMultiChildFragment(item, fragment, data);
        }
    }

    /**
     * Inflate a element
     * @param id
     * @param element
     * @param data
     */
    inflate(id, element, data, inflate = null, removeMarked = true) {
        const fn = inflate || this._items.get(id).inflate;
        fn(element, data);

        if (removeMarked == true) {
            this._removeElements(element);
        }
    }

    /**
     * Remove elements that are tagged for removal
     * @param element
     * @private
     */
    _removeElements(element) {
        let removedElements = [];

        if (Array.isArray(element)) {
            element.forEach(el => {
                const removed = el.querySelectorAll('[remove="true"]');
                if (removed.length > 0) {
                    removedElements = [...removedElements, ...removed];
                }
            })
        }
        else {
            removedElements = element.querySelectorAll('[remove="true"]');
        }

        for (let rel of removedElements) {
            rel.parentElement.removeChild(rel);
        }
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

    /**
     * Return elements back to the store for use again later
     * @param id
     * @param elements
     * @param restore
     */
    returnElements(id, elements, restore = false) {
        crsbinding.elementStoreManager.returnElements(id, elements, restore)
    }
}

class InflationCodeGenerator {
    constructor(ctxName, parentKey) {
        this.parentKey = parentKey;
        this.templateKeys = [];
        this.inflateSrc = [];
        this.deflateSrc = [];
        this._ctxName = ctxName;
    }

    dispose() {
        this.inflateSrc = null;
        this.deflateSrc = null;
    };

    generateCodeFor(template) {
        const children = template.content == null ? template.children : template.content.children;
        const childCount = children.length;

        if (childCount == 1) {
            this.path = "element";

            for (let element of children) {
                this._processElement(element);
            }
        }
        else {
            // process as array - must pass an array of elements to inflation not just a single element
            for (let i = 0; i < children.length; i++) {
                this.path = `element[${i}]`;
                this._processElement(children[i]);
            }
        }

        const inflateCode = this.inflateSrc.join("\n");
        const deflateCode = this.deflateSrc.join("\n");

        return {
            childCount: childCount,
            inflate: new Function("element", this._ctxName, inflateCode),
            deflate: new Function("element", this._ctxName, deflateCode)
        }
    }

    _processElement(element) {
        this._processInnerText(element);
        this._processAttributes(element);

        const path = this.path;
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];

            if (child.nodeName == "TEMPLATE") {
                this._processTemplate(child);
            }
            else {
                this.path = `${path}.children[${i}]`;
                this._processElement(element.children[i]);
            }
        }
    }

    _processTemplate(element) {
        const key = `${this.parentKey}_${this.templateKeys.length + 1}`;
        this.templateKeys.push(key);
        element.dataset.key = key;

        const value = element.getAttribute("for.once");
        if (value != null) {
            const parts = forStatementParts(value);
            const code = `${this.path}.appendChild(crsbinding.inflationManager.get("${key}", ${parts.plural}));`;
            this.inflateSrc.push(code);

            crsbinding.inflationManager.register(key, element, parts.singular);
            element.parentElement.removeChild(element);
        }
    }

    _processInnerText(element) {
        if (element.children == null || element.children.length > 0 || element.innerHTML.indexOf("${") == -1) return;

        const text = (element.innerHTML || "").trim();
        let target = element.textContent ? "textContent" : "innerText";

        let exp = text;
        const san = crsbinding.expression.sanitize(exp, this._ctxName);
        exp = san.expression;

        if (san.isHTML == true) {
            target = "innerHTML";
        }

        this.inflateSrc.push([`${this.path}.${target} = ` + "`" + exp + "`"].join(" "));
        this.deflateSrc.push(`${this.path}.${target} = "";`);
    }

    _processAttributes(element) {
        const attributes = Array.from(element.attributes).filter(attr =>
            attr.value.indexOf("${") != -1 ||
            attr.name.indexOf(".if") != -1 ||
            attr.name.indexOf(".attr") != -1 ||
            attr.name.indexOf("style.") != -1 ||
            attr.name.indexOf("classlist." != -1)
        );

        for (let attr of attributes) {
            if (attr.name.indexOf(".attr") != -1) {
                this._processAttr(attr);
            }
            else if (attr.value.indexOf("${") != -1) {
                this._processAttrValue(attr);
            }
            else {
                this._processAttrCondition(attr);
            }
        }
    }

    _processAttr(attr) {
        const attrName = attr.name.replace(".attr", "");
        const exp = crsbinding.expression.sanitize(attr.value, this._ctxName).expression;
        this.inflateSrc.push(`${this.path}.setAttribute("${attrName}", ${exp})`);
    }

    _processAttrValue(attr) {
        const text = attr.value.trim();
        let exp = text.substr(2, text.length - 3);
        exp = crsbinding.expression.sanitize(exp, this._ctxName).expression;

        if (attr.name == "xlink:href") {
            this.inflateSrc.push(`${this.path}.setAttributeNS("http://www.w3.org/1999/xlink", "xlink:href", ${exp});`);
        }
        else {
            const parts = exp.split("?");
            this.inflateSrc.push(`if (${parts[0].trim()} != null) {${this.path}.setAttribute("${attr.name}", ${exp});}`);
        }


        this.deflateSrc.push(`${this.path}.removeAttribute("${attr.name}");`);
        attr.ownerElement.removeAttribute(attr.name);
    }

    _processAttrCondition(attr) {
        if (attr.name.trim().indexOf("style.") == 0) {
            return this._processStyle(attr);
        }
        
        if (attr.name.trim().indexOf("classlist") == 0) {
            return this._processClassList(attr);
        }
        
        if (attr.name.trim().indexOf(".if") != -1) {
            return this._processConditional(attr);
        }
    }

    _processStyle(attr) {
        const parts = attr.name.split(".");
        const prop = crsbinding.utils.capitalizePropertyPath(parts[1]);
        const value = crsbinding.expression.sanitize(attr.value.trim(), this._ctxName).expression;

        this.inflateSrc.push(`${this.path}.style.${prop} = ${value};`);
        this.deflateSrc.push(`${this.path}.style.${prop} = "";`);
        attr.ownerElement.removeAttribute(attr.name);
    }

    _processClassList(attr) {
        const parts = attr.value.split("?");
        const condition = crsbinding.expression.sanitize(parts[0], this._ctxName).expression;

        const values = parts[1].split(":");
        const trueValue = values[0].trim();
        const falseValue = values.length > 1 ? values[1].trim() : "";
        
        const trueCode = trueValue.indexOf("[") == -1 ? trueValue : `...${trueValue}`;
        let code = `if (${condition}) {${this.path}.classList.add(${trueCode});}`;

        if (falseValue.length > 0) {
            let falseCode = falseValue.indexOf("[") == -1 ? falseValue : `...${falseValue}`;
            code += `else {${this.path}.classList.add(${falseCode});}`;
        }
        
        const deflateCode = `while (${this.path}.classList.length > 0) {${this.path}.classList.remove(${this.path}.classList.item(0));}`
        
        this.inflateSrc.push(code);
        this.deflateSrc.push(deflateCode);
        attr.ownerElement.removeAttribute(attr.name);
    }

    _processConditional(attr) {
        const attrName = attr.name.split(".if")[0].trim();
        const expParts = attr.value.split("?");
        const condition = crsbinding.expression.sanitize(expParts[0].trim(), this._ctxName).expression;
        let code = [`if(${condition})`];
        
        const expValue = expParts.length > 1 ? expParts[1].trim() : `"${attrName}"`;
        
        if (expValue.indexOf(":") == -1) {
            code.push("{");
            code.push(`${this.path}.setAttribute("${attrName}", ${expValue});`);
            code.push("}");
            code.push(`else {${this.path}.removeAttribute("${attrName}")}`);
        }
        else {
            const condParts = expParts[1].split(":");
            code.push("{");
            code.push(`${this.path}.setAttribute("${attrName}", ${condParts[0].trim()});`);
            code.push("}");
            code.push(`else {${this.path}.setAttribute("${attrName}", ${condParts[1].trim()})}`);
        }
        
        this.inflateSrc.push(code.join(""));
        this.deflateSrc.push(`${this.path}.removeAttribute("${attrName}")`);

        attr.ownerElement.removeAttribute(attr.name);
    }
}
