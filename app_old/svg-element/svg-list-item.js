import {createElement} from "./element-factory.js"

export function createListItem(text, hasConnector, width, padding, index) {
    const height = padding * 2 + 16;

    const groupShape = createElement("g", {transform: `translate(0, ${index * height + padding + 8})`});
    const textShape = createElement("text", {transform: `translate(${padding}, ${padding})`}, text);
    groupShape.appendChild(textShape);

    if (hasConnector == true) {
        const x = width - padding - 10;
        const y = padding - 5;

        const connectorShape = createElement("circle", {transform: `translate(${x}, ${y})`, r: 5})
        groupShape.appendChild(connectorShape);
    }

    return groupShape;
}

