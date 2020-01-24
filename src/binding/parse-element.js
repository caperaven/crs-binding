import {ProviderFactory} from "./provider-factory.js";

export async function parseElements(collection, context, ctxName = "context") {
    for (let element of collection || []) {
        await parseElement(element, context, ctxName);
    }
}

export async function parseElement(element, context, ctxName = "context") {
    await parseElements(element.children, context, ctxName);

    const attributes = Array.from(element.attributes || []);
    const boundAttributes = attributes.filter(attr =>
        (attr.ownerElement.tagName == "TEMPLATE" && attr.name == "for") ||
        (attr.name.indexOf(".") != -1) ||
        ((attr.value || "").indexOf("${") == 0)
    );

    await parseAttributes(boundAttributes, context, ctxName);

    if (element.children && element.children.length == 0 && (element.innerText || "").indexOf("${") != -1) {
        ProviderFactory["inner"](element, context, null, null, ctxName);
    }
}

export async function parseAttributes(collection, context, ctxName) {
    for (let attr of collection) {
        await parseAttribute(attr, context, ctxName);
    }
}

export async function parseAttribute(attr, context, ctxName) {
    const parts = attr.name.split(".");
    let prop = parts.length == 2 ? parts[0] : parts.slice(0, parts.length -1).join(".");
    let prov = prop == "for" ? prop : parts[parts.length - 1];

    if (prop.length == 0 && attr.value[0] == "$") {
        prop = prov;
        prov = "attr";
    }

    const provider = ProviderFactory[prov](attr.ownerElement, context, prop, attr.value, ctxName);
    attr.ownerElement.removeAttribute(attr.nodeName);

    // used for testing
    return provider;
}

export async function releaseBinding(element) {
    await crsbinding.providerManager.releaseElement(element);
}

export async function releaseChildBinding(element) {
    for (let child of element.children) {
        await releaseBinding(child);
    }
}