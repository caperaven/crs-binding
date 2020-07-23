export function fragmentToText(fragment) {
    const text = [];
    for (let child of fragment.children) {
        text.push(child.outerHTML);
    }
    return text.join("");
}

export function measureElement(element) {
    console.log(element);
}

export function disposeProperties(obj) {
    const properties = Object.getOwnPropertyNames(obj).filter(prop => obj[prop] && obj[prop].__isProxy == true);
    for (let property of properties) {
        const pObj = obj[property];
        if (Array.isArray(pObj) != true) {
            disposeProperties(pObj);
        }
        delete obj[property];
    }
}