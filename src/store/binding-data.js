const data = new Map();
let _nextId = 0;

function getNextId() {
    const id = _nextId;
    _nextId += 1;
    return id;
}

function setProperty(obj, property, value) {
    obj[property] = value;
}

function setPropertyPath(obj, path, value) {
    let cobj = obj;
    const parts = path.split(".");

    for (let i = 0; i < parts.length -1; i++) {
        const part = parts[i];
        if (cobj[part] == null) {
            cobj[part] = {};
        }
        cobj = cobj[part];
    }

    cobj[parts[parts.length -1]] = value;
}

function getProperty(obj, property) {
    return obj[property]
}

function getPropertyPath(obj, path) {
    const fn = new Function("context", `try {return context.${path}} catch {return null}`);
    return fn(obj);
}

function createReference(refId, name, path) {
    const id = getNextId();
    data.set(id, {
        id: id,
        name: name,
        type: "ref",
        refId: refId,
        path: path
    });
    return id;
}

export const bindingData = {
    addObject(name, type = {}) {
        const id = getNextId();
        data.set(id, {
            id: id,
            name: name,
            type: "data",
            data: type
        });
        return id;
    },

    setProperty(id, property, value) {
        const obj = data.get(id).data;
        return property.indexOf(".") == -1 ? setProperty(obj, property, value) : setPropertyPath(obj, property, value);
    },

    getValue(id, property) {
        const obj = data.get(id);

        if (obj.type == "data") {
            const data = obj.data;
            if (property == null) return data;
            return property.indexOf(".") == -1 ? getProperty(data, property) : getPropertyPath(data, property);
        }
        else {
            const refId = obj.refId;
            return this.getReferenceValue(refId, property, obj.path);
        }
    },

    getReferenceValue(id, property, path) {
        const obj = data.get(id);

        if (obj.type == "data") {
            const p = property == null ? path : `${path}.${property}`;
            return this.getValue(id, p);
        }
        else {
            let pString = `${obj.path}.${path}`; // subObj.field1
            return this.getReferenceValue(obj.refId, property, pString)
        }
    },

    createReferenceTo(refId, name, path) {
        return createReference(refId, name, path);
    },

    clear() {
        data.forEach((value, key) => {
            delete value.data;
        });
        data.clear();
        _nextId = 0;
    }
};