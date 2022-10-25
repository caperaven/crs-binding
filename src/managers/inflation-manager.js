import {forStatementParts} from "./../lib/utils.js";
import {getConverterParts} from "../lib/converter-parts.js";

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
    async register(id, template, ctxName = "context", measure = false) {
        template = template.cloneNode(true);
        const generator = new InflationCodeGenerator(ctxName, id);
        const result = await generator.generateCodeFor(template);
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
    get(id, data, elements, start) {
        if (data == null) {
            console.error("inflation manager - get, data may not be null");
        }

        const item = this._items.get(id);
        if (item == null) return null;

        if (elements != null) {
            return this._getWithElements(item, data, elements, start || 0);
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
    _getWithElements(item, data, elements, start) {
        if (data.length == 0) return null;

        const diff = elements.length - (data.length * item.childCount);

        let fragment = null;

        if (diff < 0) {
            const length = (-1 * diff);
            fragment = crsbinding.elementStoreManager.getElements(item.id, length);
            const offset = length / item.childCount;
            const sub_start_index = data.length - offset;
            const subData = data.slice(sub_start_index, data.length);
            this._inflateElements(item, fragment, subData);
            data = data.slice(0, sub_start_index);
        }

        let index = 0;
        let elementsCollection = [];

        for (let record of data) {
            elementsCollection.length = 0;

            let start_index = (start * item.childCount) + index * item.childCount;
            for (let i = 0; i < item.childCount; i++) {
                elementsCollection.push(elements[start_index + i]);
            }

            item.inflate(elementsCollection.length > 1 ? elementsCollection : elementsCollection[0], record);
            index += 1;
        }

        // delete excess elements
        if (start == 0 && diff > 0) {
            elementsCollection = Array.from(elements);
            for (let i = diff; i > 0; i--) {
                const element = elementsCollection.pop();
                element.parentElement.removeChild(element);
            }
        }

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

    async generateCodeFor(template) {
        const children = template.content == null ? template.children : template.content.children;
        const childCount = children.length;

        if (childCount == 1) {
            this.path = "element";

            for (let element of children) {
                await this._processElement(element);
            }
        }
        else {
            // process as array - must pass an array of elements to inflation not just a single element
            for (let i = 0; i < children.length; i++) {
                this.path = `element[${i}]`;
                await this._processElement(children[i]);
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

    async _processElement(element) {
        this._clearAttributes(element);
        await this._processTextContent(element);
        await this._processAttributes(element);

        const path = this.path;
        for (let i = 0; i < element.children.length; i++) {
            const child = element.children[i];

            if (child.nodeName == "TEMPLATE") {
                this._processTemplate(child);
            }
            else {
                this.path = `${path}.children[${i}]`;
                await this._processElement(element.children[i]);
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

    async _processTextContent(element) {
        if (element.children == null || element.children.length > 0 || (element.textContent.indexOf("${") == -1 && element.textContent.indexOf("&{") == -1)) return;

        const text = (element.textContent || element.innerHTML || "").trim();
        let target = "textContent";
        let exp = text;

        if (exp.indexOf("&amp;{") != -1 || exp.indexOf("&{") != -1) {
            const path = exp.replace("${", "").replace("&amp;{", "").replace("}", "");
            const value = await crsbinding.translations.get(path);
            if (value == null) {
                this.inflateSrc.push(`crsbinding.translations.get("${path}").then(result => ${this.path}.textContent = result);`);
            }
            else {
                this.inflateSrc.push(`${this.path}.textContent = "${value}"`);
            }
        }
        else {
            let converter = null;
            if (exp.indexOf(":") != -1) {
                converter = getConverterParts(exp);
            }

            const san = crsbinding.expression.sanitize(converter?.path || exp, this._ctxName);
            exp = san.expression;

            if (san.isHTML == true) {
                target = "innerHTML";
            }

            if (converter != null) {

                let paramCode = "null";

                if (converter.parameter != null) {
                    paramCode = `JSON.parse('${JSON.stringify(converter.parameter)}')`;
                }

                exp = `crsbinding.valueConvertersManager.convert(${san.expression}, "${converter.converter}", "get", ${paramCode})${converter.postExp}`;

                this.inflateSrc.push(`${this.path}.${target} = ${exp}`);
            }
            else {
                this.inflateSrc.push([`${this.path}.${target} = ` + "`" + exp + "`"].join(" "));
            }
        }

        this.deflateSrc.push(`${this.path}.${target} = "";`);
    }

    async _processAttributes(element) {
        for (const attr of Array.from(element.attributes)) {
            if (attr.name.indexOf(".attr") != -1) {
                this._processAttr(attr);
            }
            else if (attr.value.indexOf("${") != -1) {
                this._processAttrValue(attr);
            }
            else if (attr.value.indexOf("&{") != -1) {
                await this._processTranslationValue(attr);
            }
            else if (attr.name.indexOf(".if") != -1) {
                this._processAttrCondition(attr);
            }
            else if (attr.name.indexOf('.case') != -1) {
                this._processCaseCondition(attr);
            }
            else {
                this.inflateSrc.push(`${this.path}.setAttribute("${attr.name}", "${attr.value}")`);
            }
        }
    }

    _clearAttributes(element) {
        this.inflateSrc.push(`while(${this.path}.attributes.length > 0) { ${this.path}.removeAttribute(${this.path}.attributes[0].name) };`);

        const classes = element.getAttribute("class")
        this.inflateSrc.push(`${this.path}.removeAttribute("class");`);
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

    async _processTranslationValue(attr) {
        const path = attr.value.replace("&{", "").replace("}", "");
        const value = await crsbinding.translations.get(path);
        if (value == null) {
            this.inflateSrc.push(`crsbinding.translations.get("${path}").then(result => ${this.path}.setAttribute("${attr.name}", result);`);
        }
        else {
            this.inflateSrc.push(`${this.path}.setAttribute("${attr.name}", "${value}");`);
        }
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

    _processCaseCondition(attr) {
        const statements = attr.value.split(",");

        if (attr.name.indexOf("classlist.") != -1) {
            return this._processCaseParts(attr, statements, this._processCaseClassList);
        }

        if (attr.name.indexOf("style.") != -1) {
            return this._processCaseParts(attr, statements, this._processCaseStyle);
        }

        return this._processCaseParts(attr, statements, this._processCaseAttr);
    }

    _processCaseParts(attr, parts, callback) {
        let count = 0;
        for (const part of parts) {
            const values = part.split(":");
            const exp = crsbinding.expression.sanitize(values[0].trim(), this._ctxName).expression;
            const value = values[1].trim();

            if (count == 0) {
                this.inflateSrc.push(`if (${exp}) {`)
            }
            else {
                if (exp == "context.default") {
                    this.inflateSrc.push(`else {`);
                }
                else {
                    this.inflateSrc.push(`else if (${exp}) {`);
                }
            }

            callback.call(this, attr, value);
            this.inflateSrc.push(`}`)
            count += 1;
        }
    }

    _processCaseClassList(attr, value) {
        this.inflateSrc.push(`  ${this.path}.classList.add(${value})`);
    }

    _processCaseStyle(attr, value) {
        const parts = attr.name.split(".");
        this.inflateSrc.push(`  ${this.path}.style.${parts[1]} = ${value}`);
    }

    _processCaseAttr(attr, value) {
        const attrName = attr.name.replace(".case", "");
        this.inflateSrc.push(`  ${this.path}.setAttribute('${attrName}', ${value})`);
    }
}
