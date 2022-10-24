/**
 * At runtime inflate an element or elements directly without a template.
 * 1. text content and translations <div>${model.code}</div> or <div>&{code}</div>
 * 2. attribute.attr        data-test.attr="${status}"
 * 3. attribute.if          hidden.if="status == 'closed'"
 * 4. attribute.case        style.color.case="age <= 10: 'red', age <= 20: 'blue', default: 'green'"
 */

export class StaticInflationManager {
    async inflateElements(elements, context) {
        for (const element of elements) {
            await this.inflateElement(element, context);
        }
    }

    async inflateElement(element, context) {
        await this.#parseTextContent(element, context);
        await this.#parseAttributes(element, context);
        await this.inflateElements(element.children, context);
    }

    async #parseTextContent(element, context) {
        if (element.textContent.indexOf("&{") != -1) {
            return element.textContent = await crsbinding.translations.get_with_markup(element.textContent);
        }

        if (element.textContent.indexOf("${") != -1) {
            const code = crsbinding.expression.sanitize(element.textContent).expression;
            const fn = new Function("context", ["return ", "`", code, "`"].join(""));
            element.textContent = fn(context);
        }
    }

    async #parseAttributes(element, context) {
        for (const attribute of element.attributes) {
            this.#parseAttribute(attribute, context);
        }
    }

    async #parseAttribute(attribute, context) {
        if (attribute.name.indexOf(".attr") != -1) {
            return this.#attributeAttr(attribute, context);
        }

        // attr.if
        // classlist.if
        // style.color.if
        if (attribute.name.indexOf(".if") != -1) {
            const fn = await crsbinding.expression.ifFunction(attribute.value);
            const success = fn(context);

            if (attribute.name.indexOf("classlist.if") != -1) {
                return;
            }

            if (attribute.name.indexOf("style.") != -1) {
                return;
            }

            const attr = attribute.name.replace(".if", "");

            if (attribute.value.indexOf("?") == -1) {
                if (success) {
                    attribute.ownerElement.setAttribute(attr, attr);
                }
                else {
                    attribute.ownerElement.removeAttribute(attr);
                }
                return;
            }

            if (success == undefined) {
                attribute.ownerElement.removeAttribute(attr);
            }
            else {
                attribute.ownerElement.setAttribute(attr, success);
            }

            attribute.ownerElement.removeAttribute(attribute.name);
        }


    }

    async #attributeAttr(attribute, context) {
        const name = attribute.name.replace(".attr", "");
        const code = crsbinding.expression.sanitize(attribute.value).expression;
        const fn = new Function("context", ["return ", "`", code, "`"].join(""));
        const value = fn(context);
        attribute.ownerElement.setAttribute(name, value);
    }
}