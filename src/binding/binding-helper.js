export function getProperty(obj, property) {
    const field = `_${property}`;
    if (obj[field] != null) {
        return obj[field];
    }

    return crsbinding.data.getValue(obj._dataId, property);
}

export function setProperty(obj, property, value) {
    let oldValue;
    if (value && value.__uid != null) {
        oldValue = getProperty(obj, property);
    }

    crsbinding.data.setProperty(obj._dataId, property, value);

    if (Array.isArray(value)) {
        obj[`_${property}`] = crsbinding.data.array(obj._dataId, property);
    }

    if (value && value.__uid) {
        if (oldValue != null) {
            crsbinding.data.unlinkArrayItem(oldValue);
        }

        crsbinding.data.linkToArrayItem(obj._dataId, property, value.__uid);
    }
}