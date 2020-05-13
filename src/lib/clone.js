export function clone(obj) {
    if (obj == null) return obj;
    const result = cleanClone(Object.assign({}, obj));
    return result;
}

function cleanClone(obj) {
    let properties = Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == 0);
    for (let property of properties) {
        delete obj[property];
    }

    properties =  Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == -1 && typeof obj[item] == "object");
    for (let property of properties) {
        cleanClone(obj[property]);
    }

    return obj;
}