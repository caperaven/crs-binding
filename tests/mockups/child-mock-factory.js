import init, {parse} from "./bin/html_parser.js";
import {ElementMock} from "./element-mock.js";

await init();

export function createMockChildren(element) {
    if (element.innerHTML.trim().length == 0) return;

    const jsonStr = parse(element.innerHTML.split(".").join("_"));
    const json = JSON.parse(jsonStr);
    createChildren(element, element, json);
}

function createChildren(context, element, json) {
    if (json.children.length == 1 && typeof json.children[0] == "string") {
        return element.textContent = json.children[0];
    }

    for (const item of json.children) {
        if (typeof item == "string" || item.name == "style") continue;

        const child = new ElementMock(item.name, item.id, element);

        setAttributes(context, child, item);
        setClasses(child, item);

        if (item.children != null) {
            createChildren(context, child, item);
        }
    }
}

function setAttributes(context, element, item) {
    if (item.attributes == null) return;

    const keys = Object.keys(item.attributes);
    for (const key of keys) {
        const value = item.attributes[key];

        if (key == "ref") {
            context[value] = element;
        }
        else if (key.indexOf("data-") != -1) {
            const parts = key.split("-");
            element.dataset[parts[1]] = value;
            element.setAttribute(key, value);
        }
        else if (key.indexOf("_call") != -1) {
            const parts = key.split("_call");
            element.addEventListener(parts[0], context[value]);
        }
        else {
            element.setAttribute(key, value);
        }
    }
}

function setClasses(element, item) {
    if (item.classes != null) {
        element.classList.add(item.classes);
    }
}