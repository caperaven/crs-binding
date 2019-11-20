import {ProviderFactory} from "./provider-factory.js";

export async function parseElements(collection, context, ctxName = "context") {
    for (let element of collection || []) {
        await parseElement(element, context, ctxName);
    }
}

export async function parseElement(element, context, ctxName = "context") {
    await parseElements(element.children, context, ctxName);

    const attributes = Array.from(element.attributes || []);
    const boundAttributes = attributes.filter(attr => attr.name == "for" || attr.name.indexOf(".") != -1);

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
    const prop = parts[0];
    const prov = prop == "for" ? prop : parts[1];

    return ProviderFactory[prov](attr.ownerElement, context, prop, attr.value, ctxName);
}

export async function releaseBinding(element) {
    await crsbinding.providerManager.releaseElement(element);
}