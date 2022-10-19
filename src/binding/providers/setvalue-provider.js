import {CallProvider} from "./call-provider.js";

export class SetValueProvider extends CallProvider {
    async initialize() {
        this.setPropertyHandler = setProperty.bind(this);
        const src = createSource.call(this);
        this._fn = new Function("context", "event", "element", "setProperty", src);
    }

    dispose() {
        this.setPropertyHandler = null;
        super.dispose();
    }

    event(event) {
        const context = crsbinding.data.getContext(this._context);
        crsbinding.idleTaskManager.add(this._fn(context, event, this._element, this.setPropertyHandler));
        event.stopPropagation();
    }
}

function createSource() {
    if (this._value.trim()[0] != "[") {
        return createSourceFrom.call(this, this._value);
    }

    const result = [];
    const exps = this._value.substr(1, this._value.length - 2);
    const parts = exps.split(";");

    for (let part of parts) {
        result.push(createSourceFrom.call(this, part.trim()));
    }

    return result.join("\n");
}

function createSourceFrom(exp) {
    const parts = exp.split("=");

    const value = processRightPart.call(this, parts[1].trim());
    const src = processLeftPart.call(this, parts[0].trim(), value);
    return src;
}

function processRightPart(part) {
    // <!--change.setvalue="state = attribute(this, "data-value")"-->
    // <!--state = attribute(this, "data-value")-->
    // <!--state = attribute($event.target, "data-value")-->
    // <!--state = property(#my-element, "firstName")-->

    console.log(part);

    if (part.indexOf("attribute(") != -1) {
        return processAttr.call(this, part);
    }

    if (part.indexOf("property(") != -1) {
        return processProp.call(this, part);
    }

    return crsbinding.expression.sanitize(part, this._ctxName, true).expression;
}

function processAttr(part) {
    const parts = part.replace("attribute(", "").replace(")", "").split(",");
    const left = parts[0].trim();
    const attr = parts[1].trim();

    if (left == "this") {
        return `element.getAttribute(${attr})`
    }

    if (left.indexOf("$event") != -1) {
        return `${left.replace("$", "")}.getAttribute(${attr})`;
    }

    return `document.querySelector(${left}).getAttribute(${attr})`;
}

function processProp(part) {
    const parts = part.replace("property(", "").replace(")", "").split(",");
    const left = parts[0].trim();
    const attr = parts[1].trim();

    if (left == "this") {
        return `element[${attr}]`
    }

    if (left.indexOf("$event") != -1) {
        return `${left.replace("$", "")}[${attr}]`;
    }

    return `document.querySelector(${left})[${attr}]`;
}

function processLeftPart(part, value) {
    if (part.indexOf("$globals") != -1) {
        return getGlobalSetter.call(this, part, value);
    }
    else {
        return getContextSetter.call(this, part, value);
    }
}

function getGlobalSetter(part, value) {
    const path = part.replace("$globals.", "");
    return `crsbinding.data.setProperty({_dataId: crsbinding.$globals}, "${path}", ${value});`;
}

function getContextSetter(part, value) {
    part = part.replace("$context.", "");

    if (value.indexOf("context.") != -1) {
        const parts = value.split("context.");
        const property = parts[parts.length -1];
        let prefix = parts[0] == "!" ? "!" : "";
        value = `${prefix}crsbinding.data.getValue({_dataId: ${this._context}}, "${property}")`;
    }

    return `crsbinding.data.setProperty({_dataId: ${this._context}}, "${part}", ${value});`;
}

function setProperty(obj, property, value) {
    if (value !== undefined) {
        crsbinding.data.setProperty(this, property, value);
    }
}

