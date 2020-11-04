export function ForOnceProvider(element, context, property, value, ctxName = "context", parentId) {
    if (value.indexOf("$parent.") != -1) {
        value = value.split("$parent.").join("");
        context = parentId;
    }
    const parts = value.split("of");
    const singular = parts[0].trim();
    const plural = parts[1].trim();

    const key = `for-once-${singular}`;

    crsbinding.inflationManager.register(key, element, singular);
    const data = crsbinding.data.getValue(context, plural);
    const elements = crsbinding.inflationManager.get(key, data);
    crsbinding.inflationManager.unregister(key);

    element.parentElement.appendChild(elements);
    element.parentElement.removeChild(element);
}