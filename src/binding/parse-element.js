import {ProviderFactory} from "./provider-factory.js";

export async function parseElements(collection, context) {
    for (let element of collection) {
        await parseElement(element, context);
    }
}

export async function parseElement(element, context) {
    await parseElements(element.children);

    const attributes = Array.from(element.attributes);
    const boundAttributes = attributes.filter(attr => attr.name.indexOf(".") != -1);

    await parseAttributes(boundAttributes, context);
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

    const provider = ProviderFactory[prov]();

    return provider;
}

export function releaseBinding(element) {
    console.log(element);
}