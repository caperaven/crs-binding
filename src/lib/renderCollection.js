export function renderCollection(template, collection, removeInflated = true, parentElement = null) {
    parentElement = parentElement || template.parentElement;

    if (removeInflated == true) {
        const toRemove = Array.from(parentElement.children).filter(item => item.__inflated == true);
        for (let el of toRemove) {
            el.parentElement.removeChild(el);
        }
    }

    crsbinding.inflationManager.register("render-collection", template);
    const elements = crsbinding.inflationManager.get("render-collection", collection);
    parentElement.appendChild(elements);
    crsbinding.inflationManager.unregister("render-collection");
}