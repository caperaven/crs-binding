import {getValueOnPath} from "./../../lib/path-utils.js";

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
    const data = crsbinding.data.getValue(context, value);
    const path = value.replace(`${ctxName}.`, "");
    const v = getValueOnPath(data, path);

    setProperty(element, property, v);
}

function setProperty(element, property, value) {
    if (property.indexOf("data-") == -1) {
        property = crsbinding.utils.capitalizePropertyPath(property);

        const fn = new Function("element", "value", `element.${property} = value`);
        fn(element, value);
    }
    else {
        const prop = property.replace("data-", "");
        element.dataset[prop] = value;
    }
}