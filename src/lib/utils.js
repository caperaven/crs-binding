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
    if (obj == null || Object.isFrozen(obj)) return;

    const properties = Object.getOwnPropertyNames(obj).filter(name => ignoreDispose.indexOf(name) == -1);

    for (let property of properties) {
        const pObj = obj[property];

        if (typeof pObj == "object") {
            if (pObj == null || pObj.autoDispose == false) {
                continue;
            }

            if (Array.isArray(pObj) != true) {
                disposeProperties(pObj);
            }
        }

        delete obj[property];
    }
}

export function setElementCleanupProperty(element, property, value) {
    element[property] = value;
    element.__cleanup = element.__cleanup || [];
    element.__cleanup.push(property);
}

export function getPathOfFile(file) {
    if (file == null) return file;

    if (file[file.length - 1] == "/") {
        return file;
    }

    const parts = file.split("/");
    parts.pop();
    return `${parts.join("/")}/`;
}

export function relativePathFrom(source, target) {
    const folder = getPathOfFile(source);

    const processParts = ["", "."];
    const targetParts = target.split("./");
    const sourceParts = folder.split("/");

    sourceParts.pop();

    let count = 0;
    for (let i = 0; i < targetParts.length; i++) {
        const str = targetParts[i]
        if (processParts.indexOf(str) === -1) {
            break;
        }

        if (str == ".") {
            sourceParts.pop();
        }

        count += 1;
    }

    targetParts.splice(0, count);
    const targetStr = targetParts.join("/");
    const sourceStr = sourceParts.join("/");

    return `${sourceStr}/${targetStr}`;
}

export function forStatementParts(value) {
    const parts = value.split("of");
    const singular = parts[0].trim();
    const plural = parts[1].trim();
    return {
        singular: singular,
        plural: plural
    }
}

/**
 * Flatten an object path structure to a key value pair on the target
 * @param prefix
 * @param obj
 * @param target
 */
export function flattenPropertyPath(prefix, obj, target) {
    if (typeof obj === "string") {
        if (prefix[0] === ".") {
            prefix = prefix.substring(1);
        }
        target[prefix] = obj;
    }
    else {
        const keys = Object.keys(obj);
        for (let key of keys) {
            flattenPropertyPath(`${prefix}.${key}`, obj[key], target);
        }
    }
}