const data = new Map();
const callbacks = new Map();

let _nextId = 0;

function getNextId() {
    const id = _nextId;
    _nextId += 1;
    return id;
}

function callFunctions(id, property) {
    const obj = callbacks.get(id);
    if (obj[property] == null) return;

    for(let fn of obj[property].functions) {
        const value = bindingData.getValue(id, property);
        fn(property, value);
    }
}

function addCallback(obj, property, callback) {
    obj[property] = obj[property] || {
        functions: []
        // JHR: todo: conditions need to badded in this place when they are set.
    };
    obj[property].functions.push(callback);
}

function addCallbackPath(obj, path, callback) {
    ensurePath(obj, path, (obj, prop) => {
        addCallback(obj, prop, callback);
    });
}

function ensurePath(obj, path, callback) {
    let cobj = obj;
    const parts = path.split(".");

    for (let i = 0; i < parts.length -1; i++) {
        const part = parts[i];
        if (cobj[part] == null) {
            cobj[part] = {};
        }
        cobj = cobj[part];
    }

    callback(cobj, parts[parts.length -1]);
}

function setProperty(obj, property, value) {
    obj[property] = value;
}

function setPropertyPath(obj, path, value) {
    ensurePath(obj, path, (obj,  prop) => obj[prop] = value);
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
    details: {data: data, callbacks: callbacks},

    setName(id, name) {
        data.get(id).name = name;
    },

    addObject(name, type = {}) {
        const id = getNextId();
        data.set(id, {
            id: id,
            name: name,
            type: "data",
            data: type
        });

        callbacks.set(id, {});

        return id;
    },

    addCallback(id, property, callback) {
        const obj = callbacks.get(id);
        return property.indexOf(".") == -1 ? addCallback(obj, property, callback) : addCallbackPath(obj, property, callback);
    },

    setProperty(id, property, value) {
        const obj = data.get(id).data;
        property.indexOf(".") == -1 ? setProperty(obj, property, value) : setPropertyPath(obj, property, value);

        callFunctions(id, property);
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