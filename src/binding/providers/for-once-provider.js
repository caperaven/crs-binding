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

    crsbinding.inflationManager.register(key, element, singular);
    const data = crsbinding.data.getValue(context, plural);
    const elements = crsbinding.inflationManager.get(key, data);
    crsbinding.inflationManager.unregister(key);

    element.parentElement.appendChild(elements);
    element.parentElement.removeChild(element);
}





/**

 1. check for nexted templates.
    exist = yes
        1.1 register
        1.2 set the key on the template
            1.2.1 code gen then uses "element.elements[n].appendChild(crsb.inflationManager.get(key, item.items))"

 **/