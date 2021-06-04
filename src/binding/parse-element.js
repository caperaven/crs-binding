import {ProviderFactory} from "./provider-factory.js";

const ignore = ["style", "script"];

export async function parseElements(collection, context, options) {
    for (let element of collection || []) {
        await crsbinding.parsers.parseElement(element, context, options);
    }
}

export async function parseElement(element, context, options) {
    let ctxName = "context";
    let parentId = null;
    let folder = null;

    if (options != null) {
        ctxName = options.ctxName || "context";
        parentId = options.parentId || null;
        folder = options.folder || null;
    }

    if (element.__inflated == true) return;

    const nodeName = element.nodeName.toLowerCase();
    if (ignore.indexOf(nodeName) != -1) return;

    if (nodeName != "template" && element.children?.length > 0) {
        await parseElements(element.children, context, options);
    }

    if (nodeName == "template" && element.getAttribute("src") != null) {
        return await parseHTMLFragment(element, context, options);
    }

    const attributes = Array.from(element.attributes || []);
    const boundAttributes = attributes.filter(attr =>
        (attr.ownerElement.tagName.toLowerCase() == "template" && attr.name == "for") ||
        (attr.name.indexOf(".") != -1) ||
        ((attr.value || "").indexOf("${") == 0)
    );

    await parseAttributes(boundAttributes, context, ctxName, parentId);

    if (element.children && element.children.length == 0 && (element.innerText || element.textContent || "").indexOf("${") != -1) {
        ProviderFactory["inner"](element, context, null, null, ctxName, null, parentId);
    }

    if (nodeName === "svg") {
        crsbinding.svgCustomElements.parse(element);
    }
}

async function parseAttributes(collection, context, ctxName, parentId) {
    for (let attr of collection) {
        await parseAttribute(attr, context, ctxName, parentId);
    }
}

async function parseAttribute(attr, context, ctxName, parentId) {
    const parts = attr.name.split(".");
    let prop = parts.length == 2 ? parts[0] : parts.slice(0, parts.length -1).join(".");
    let prov = prop == "for" ? prop : parts[parts.length - 1];

    if (prop.length == 0 && attr.value[0] == "$") {
        prop = prov;
        prov = "attr";
    }

    const provider = ProviderFactory[prov](attr.ownerElement, context, prop, attr.value, ctxName, attr, parentId);

    if (provider == null || provider.constructor.name != "AttrProvider" || attr.nodeName.indexOf(".attr") != -1) {
        attr.ownerElement.removeAttribute(attr.nodeName);
    }

    return provider;
}

async function parseHTMLFragment(element, context, options) {
    if (options.folder == null) return;

    const file = crsbinding.utils.relativePathFrom(options.folder, element.getAttribute('src'));

    const tpl = document.createElement("template");
    tpl.innerHTML = await fetch(file).then(result => result.text());
    const instance = tpl.content.cloneNode(true);
    await parseElements(instance.children, context, options);

    const parent = element.parentElement;
    parent.insertBefore(instance, element);
    parent.removeChild(element);
}

export function releaseBinding(element) {
    crsbinding.providerManager.releaseElement(element);
}

export function releaseChildBinding(element) {
    for (let child of element.children) {
        releaseBinding(child);
    }
}