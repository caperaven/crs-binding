export function getValueOnPath(object, path) {
    let obj = object;
    if (path.indexOf(".") == -1) {
        return obj[path];
    }

    const parts = path.split(".");
    for (let i = 0; i < parts.length -1; i++) {
        const part = parts[i];
        obj = obj[part];
        if (obj == null) return null;
    }
    return obj[parts[parts.length -1]];
}

export function getPropertyNamesOnPath(obj, path, filter) {
    const value = getValueOnPath(obj, path);
    let properties = Object.getOwnPropertyNames(value);

    if (filter != null) {
        properties = properties.filter(filter);
    }

    return properties;
}