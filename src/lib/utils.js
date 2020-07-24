export function fragmentToText(fragment) {
    const text = [];
    for (let child of fragment.children) {
        text.push(child.outerHTML);
    }
    return text.join("");
}

export function measureElement(element) {
    return new Promise(resolve => {
        let el = element;
        let result;

        if (element.nodeName === "#document-fragment") {
            el = document.createElement("div");
            el.appendChild(element);
            el.style.width = "max-content";
            el.style.height = "max-content";
            el.style.position = "fixed";
            el.style.transform = "translate(-100px, -100px)";

            document.body.appendChild(el);
            result = el.getBoundingClientRect();
            document.body.removeChild(el);
        }
        else {
            result = el.getBoundingClientRect();
        }

        resolve(result);
    })
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