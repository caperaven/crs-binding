export function renderCollection(template, data, elements = null, parentElement = null) {
    const id = "render-collection";
    crsbinding.inflationManager.register(id, template);

    let fragment = crsbinding.inflationManager.get(id, data, elements, 0);

    if (fragment != null && parentElement != null) {
        parentElement.appendChild(fragment);
    }

    crsbinding.inflationManager.unregister(id);

    // parentElement = parentElement || template.parentElement;
    //
    // if (oldElements == null) {
    //     const toRemove = Array.from(parentElement.children).filter(item => item.__inflated == true);
    //     for (let el of toRemove) {
    //         el.parentElement.removeChild(el);
    //     }
    // }
    //
    // crsbinding.inflationManager.register("render-collection", template);
    // const elements = crsbinding.inflationManager.get("render-collection", collection, oldElements);
    //
    // if (elements != null) {
    //     parentElement.appendChild(elements);
    // }
    //
    // crsbinding.inflationManager.unregister("render-collection");
}