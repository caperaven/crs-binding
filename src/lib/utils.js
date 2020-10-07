/**
 * Get the HTML string value for a given document fragment
 * @param fragment
 * @returns {string}
 */
export function fragmentToText(fragment) {
    const text = [];
    for (let child of fragment.children) {
        text.push(child.outerHTML);
    }
    return text.join("");
}

/**
 * Create a clone from the template element
 * @param element
 */
export function cloneTemplate(element) {
    return element.content != null ? element.content.cloneNode(true) : element.children[0].cloneNode(true);
}

/**
 * Measure element dimensions
 * @param element
 * @returns {Promise<unknown>}
 */
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

/**
 * Clean up and dispose all properties of a object
 * @type {string[]}
 */
const ignoreDispose = ["_element"];
export function disposeProperties(obj) {
    if (obj == null) return;
    const properties = Object.getOwnPropertyNames(obj).filter(name => ignoreDispose.indexOf(name) == -1);
    for (let property of properties) {
        const pObj = obj[property];
        if (typeof pObj == "object" && Array.isArray(pObj) != true) {
            disposeProperties(pObj);
        }
        delete obj[property];
    }
}

export function setElementCleanupProperty(element, property, value) {
    element[property] = value;
    element.__cleanup = element.__cleanup || [];
    element.__cleanup.push(property);
}