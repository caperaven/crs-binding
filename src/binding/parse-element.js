import {ProviderFactory} from "./provider-factory.js";

export async function parseElements(collection, context) {
    for (let element of collection || []) {
        await parseElement(element, context);
    }
}

export async function parseElement(element, context) {
    await parseElements(element.children, context);

    const attributes = Array.from(element.attributes || []);
    const boundAttributes = attributes.filter(attr => attr.name.indexOf(".") != -1);

    await parseAttributes(boundAttributes, context);

    if (element.children && element.children.length == 0 && element.innerText.indexOf("${") != -1) {
        ProviderFactory["inner"](element, context);
    }
}

export async function parseAttributes(collection, context) {
    for (let attr of collection) {
        await parseAttribute(attr, context);
    }
}

export async function parseAttribute(attr, context) {
    const parts = attr.name.split(".");
    const prop = parts[0];
    const prov = parts[1];

    return ProviderFactory[prov](attr.ownerElement, context, prop, attr.value);
}

export async function releaseBinding(element) {
    await crsbinding.providerManager.releaseElement(element);
}