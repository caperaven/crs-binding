import {setElementCleanupProperty} from "../../lib/utils.js";

export function OnceProvider(element, context, property, value, ctxName = "context", parentId) {
    if (ctxName == "context") {
        setContext(element, context, property, value, parentId);
    }
    else {
        setItem(element, context, property, value, ctxName, parentId);
    }

    return null;
}

function setContext(element, context, property, value) {
    setProperty(element, property, crsbinding.data.getValue(context, value));
}

function setItem(element, context, property, value, ctxName) {
    if (ctxName != "context") {
        value = value.split(`${ctxName}.`).join("");
    }

    const data = crsbinding.data.getValue(context, value);
    setProperty(element, property, data);
}

function setProperty(element, property, value) {
    if (property.indexOf("data-") == -1) {
        property = crsbinding.utils.capitalizePropertyPath(property);
        setElementCleanupProperty(element, property, value);
    }
    else {
        const prop = property.replace("data-", "");
        element.dataset[prop] = value;
    }
}