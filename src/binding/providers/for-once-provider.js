export function ForOnceProvider(element, context, property, value, ctxName = "context", parentId) {
    if (value.indexOf("$parent.") != -1) {
        value = value.split("$parent.").join("");
        context = parentId;
    }
    const parts = value.split("of");
    const singular = parts[0].trim();
    const plural = parts[1].trim();

    crsbinding.inflationManager.register("for-once", element, singular);

    const data = crsbinding.data.getValue(context, plural);

    const elements = crsbinding.inflationManager.get("for-once", data);
    element.parentElement.appendChild(elements);
    element.parentElement.removeChild(element);

    crsbinding.inflationManager.unregister("for-once");
}