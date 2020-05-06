import {ProviderFactory} from "./provider-factory.js";

const ignore = ["STYLE"];

export function parseElements(collection, context, ctxName = "context") {
    for (let element of collection || []) {
        if (ignore.indexOf(element.nodeName) == -1) {            
            parseElement(element, context, ctxName);
        }
    }
}

export function parseElement(element, context, ctxName = "context") {
    parseElements(element.children, context, ctxName);

    const attributes = Array.from(element.attributes || []);
    const boundAttributes = attributes.filter(attr =>
        (attr.ownerElement.tagName == "TEMPLATE" && attr.name == "for") ||
        (attr.name.indexOf(".") != -1) ||
        ((attr.value || "").indexOf("${") == 0)
    );

    parseAttributes(boundAttributes, context, ctxName);

    if (element.children && element.children.length == 0 && (element.innerText || element.textContent || "").indexOf("${") != -1) {
        ProviderFactory["inner"](element, context, null, null, ctxName);
    }
}

export function parseAttributes(collection, context, ctxName) {
    for (let attr of collection) {
        parseAttribute(attr, context, ctxName);
    }
}

export function parseAttribute(attr, context, ctxName) {
    const parts = attr.name.split(".");
    let prop = parts.length == 2 ? parts[0] : parts.slice(0, parts.length -1).join(".");
    let prov = prop == "for" ? prop : parts[parts.length - 1];

    if (prop.length == 0 && attr.value[0] == "$") {
        prop = prov;
        prov = "attr";
    }

    const provider = ProviderFactory[prov](attr.ownerElement, context, prop, attr.value, ctxName, attr);

    if (provider == null || provider.constructor.name != "AttrProvider") {
        attr.ownerElement.removeAttribute(attr.nodeName);
    }

    return provider;
}

export function releaseBinding(element) {
    crsbinding.providerManager.releaseElement(element);
}

export function releaseChildBinding(element) {
    for (let child of element.children) {
        releaseBinding(child);
    }
}