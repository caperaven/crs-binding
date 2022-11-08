export async function renderCollection(template, data, elements = null, parentElement = null) {
    const id = "render-collection";
    await crsbinding.inflationManager.register(id, template);

    let fragment = crsbinding.inflationManager.get(id, data, elements, 0);

    if (fragment != null && parentElement != null) {
        parentElement.appendChild(fragment);
    }

    crsbinding.inflationManager.unregister(id);
}