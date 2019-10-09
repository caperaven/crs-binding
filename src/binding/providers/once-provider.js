export function OnceProvider(element, context, property, value) {
    element[property] = context[value];
    return null;
}