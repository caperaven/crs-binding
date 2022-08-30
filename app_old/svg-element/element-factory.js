const ns = "http://www.w3.org/2000/svg";

export function createElement(tagName, attrs, textContent) {
    const element = document.createElementNS(ns, tagName);
    if (textContent != null) element.textContent = textContent;
    const keys = Object.keys(attrs);
    keys.forEach(key => element.setAttribute(key, attrs[key]));
    return element;
}