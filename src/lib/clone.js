export function clone(obj, eventsHolder) {
    if (obj == null) return obj;

    let result = cleanClone(Object.assign({}, obj));

    if (obj.__isProxy) {
        result = crsbinding.observation.observe(result, eventsHolder);
        cloneProperties(obj);
    }

    return result;
}

function cleanClone(obj) {
    const properties = Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == 0);
    for (let property of properties) {
        delete obj[property];
    }
    return obj;
}

function cloneProperties(obj) {
    const properties = Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == -1);
    for (let property of properties) {
        const prop = obj[property];
        if (prop && prop.__isProxy == true) {
            obj[property] = clone(prop, prop);
        }
    }
    return obj;
}