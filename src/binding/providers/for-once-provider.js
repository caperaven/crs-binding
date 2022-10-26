import {forStatementParts} from "./../../lib/utils.js";

export function ForOnceProvider(element, context, property, value, ctxName = "context", parentId) {
    if (value.indexOf("$parent.") != -1) {
        value = value.split("$parent.").join("");
        context = parentId;
    }

    const parts = forStatementParts(value);
    const singular = parts.singular;
    const plural = parts.plural;

    const key = `for-once-${singular}`;

    crsbinding.inflationManager.register(key, element, singular).then(()=> {
        const data = crsbinding.data.getValue(context, plural);
        const elements = crsbinding.inflationManager.get(key, data);
        crsbinding.inflationManager.unregister(key);

        element.parentElement.appendChild(elements);
        element.parentElement.removeChild(element);
    });
}