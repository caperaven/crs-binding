export function forceClean(id) {
    if (typeof id == "object") {
        id = id.__uid || id._dataId;
    }

    if (id == null) return;

    const toRemove = crsbinding.data.removeObject(id);
    const elements = new Set();

    for (let did of toRemove) {
        const providers = Array.from(crsbinding.providerManager.items).filter(item => item[1]._context === did);
        for (let provider of providers) {
            elements.add(provider[1]._element);
        }
    }

    for (let element of elements) {
        crsbinding.providerManager.releaseElement(element);
    }

    elements.length = 0;
}