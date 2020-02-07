export function OnceProvider(element, context, property, value, ctxName) {
    if (ctxName == "context") {
        setContext(element, context, property, value);
    }
    else {
        setItem(element, context, property, value, ctxName);
    }

    return null;
}

function setContext(element, context, property, value) {
    const fn = new Function("context", `return context.${value}`);
    setProperty(element, property, fn(context));
}

function setItem(element, context, property, value, ctxName) {
    const fn = new Function(ctxName, `return ${value}`);
    setProperty(element, property, fn(context));
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