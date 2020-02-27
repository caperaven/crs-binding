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
        const generator = new InflationCodeGenerator();
        const result = generator.generateCodeFor(template);
        generator.dispose();

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
            this.inflate(id, element.children[0], d, item.inflate);
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

class InflationCodeGenerator {
    constructor() {
        this.inflateSrc = [];
        this.deflateSrc = [];
    }

    dispose() {
        this.inflateSrc = null;
        this.deflateSrc = null;
    };

    generateCodeFor(template) {
        const element = template.content.children[0];
        this.path = "element";

        this._processElement(element);

        const inflateCode = this.inflateSrc.join("\n");
        const deflateCode = this.deflateSrc.join("\n");

        return {
            inflate: new Function("element", "context", inflateCode),
            deflate: new Function("element", "context", deflateCode)
        }
    }

    _processElement(element) {
        this._processInnerText(element);
        this._processAttributes(element);

        const path = this.path;
        for (let i = 0; i < element.children.length; i++) {
            this.path = `${path}.children[${i}]`;
            this._processElement(element.children[i]);
        }
    }

    _processInnerText(element) {
        const text = (element.innerHTML || "").trim();
        if (text.indexOf("${") == 0) {
            let exp = text.substr(2, text.length - 3);
            exp = crsbinding.expression.sanitize(exp).expression;
            this.inflateSrc.push(`${this.path}.innerText = ${exp};`);
            this.deflateSrc.push(`${this.path}.innerText = "";`);
        }
    }

    _processAttributes(element) {
        const attributes = Array.from(element.attributes).filter(attr => attr.value.indexOf("${") != -1 || attr.name.indexOf(".if") != -1);
        for (let attr of attributes) {
            if (attr.value.indexOf("${") != -1) {
                this._processAttrValue(attr);
            }
            else {
                this._processAttrCondition(attr);
            }
        }
    }

    _processAttrValue(attr) {
        const text = attr.value.trim();
        let exp = text.substr(2, text.length - 3);
        exp = crsbinding.expression.sanitize(exp).expression;
        this.inflateSrc.push(`${this.path}.setAttribute("${attr.name}", ${exp});`);
        this.deflateSrc.push(`${this.path}.removeAttribute("${attr.name}");`);
        attr.ownerElement.removeAttribute(attr.name);
    }

    _processAttrCondition(attr) {
        if (attr.name.trim().indexOf("style") == 0) {
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
        const prop = parts[1];
        const value = crsbinding.expression.sanitize(attr.value.trim()).expression;

        this.inflateSrc.push(`${this.path}.style.${prop} = ${value};`);
        this.deflateSrc.push(`${this.path}.style.${prop} = "";`);
        attr.ownerElement.removeAttribute(attr.name);
    }

    _processClassList(attr) {
        const parts = attr.value.split("?");
        const condition = crsbinding.expression.sanitize(parts[0]).expression;

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
        const condition = crsbinding.expression.sanitize(expParts[0].trim()).expression;
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
