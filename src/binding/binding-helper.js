export function getProperty(obj, property) {
    const field = `_${property}`;
    if (obj[field] != null) {
        return obj[field];
    }

    return crsbinding.data.getValue(obj._dataId, property);
}

export function setProperty(obj, property, value) {
    let oldValue = getProperty(obj, property);

    if (Array.isArray(oldValue)) {
        crsbinding.data.array(obj, property).splice(0, oldValue.length);
    }
    if (value && value.__uid != null) {
        oldValue && crsbinding.data.unlinkArrayItem(oldValue);
    }

    crsbinding.data.setProperty(obj._dataId, property, value);

    if (Array.isArray(value)) {
        obj[`_${property}`] = crsbinding.data.array(obj._dataId, property);
    }

    if (value && value.__uid) {
        crsbinding.data.linkToArrayItem(obj._dataId, property, value.__uid);
    }
}