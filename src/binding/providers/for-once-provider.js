export function ForOnceProvider(element, context, property, value, ctxName = "context") {
    const parts = value.split("of");
    const singular = parts[0].trim();
    const plural = parts[1].trim();

    crsbinding.inflationManager.register("for-once", element, singular);

    const dataFn = new Function("context", `return context.${plural}`);
    const data = dataFn(context);
    const elements = crsbinding.inflationManager.get("for-once", data);
    element.parentElement.appendChild(elements);
}