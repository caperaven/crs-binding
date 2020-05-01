const data = new Map();
const callbacks = new Map();
const updates = new Map();
const triggers = new Map();

let _nextId = 0;

function getNextId() {
    const id = _nextId;
    _nextId += 1;
    return id;
}

function callFunctions(id, property) {
    const obj = callbacks.get(id);
    if (obj[property] == null) return;
    callFunctionsOnObject(obj[property], id, property);
}

function callTriggers(id, property) {
    const obj = triggers.get(id);
    if (obj == null || obj[property] == null) return;
    for (let trigger of obj[property]) {
        callFunctions(trigger.id, trigger.property);
    }
}

function callFunctionsOnObject(obj, id, property) {
    const functions = obj.functions;
    if (functions != null) {
        for(let fn of obj.functions) {
            const value = bindingData.getValue(id, property);
            fn(property, value);
        }
    }

    const properties = Object.getOwnPropertyNames(obj).filter(p => p != "functions");
    for (let prop of properties) {
        callFunctionsOnObject(obj[prop], id, `${property}.${prop}`);
    }
}

function performUpdates(id, property, value) {
    const obj = updates.get(id);
    if (obj == null || obj[property] == null) return;
    bindingData.setProperty(obj[property].originId, obj[property].originProperty, value);
}

function addCallback(obj, property, callback) {
    obj[property] = obj[property] || {};
    obj[property].functions = obj[property].functions || [];
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
    if (obj[property] != value) {
        obj[property] = value;
        return true;
    }
    return false;
}

function setPropertyPath(obj, path, value) {
    let result = true;
    ensurePath(obj, path, (obj,  prop) => result = setProperty(obj, prop, value));
    return result;
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

function addUpdateOrigin(sourceId, sourceProp, targetId, targetProp) {
    const update = updates.get(targetId) || {};
    const source = update[targetProp] || {};

    if (source.originId == sourceId && source.originProperty == sourceProp) return;

    source.originId = sourceId;
    source.originProperty = sourceProp;
    update[targetProp] = source;
    updates.set(targetId, update);
}

function addTriggers(sourceId, sourceProp, targetId, targetProp) {
    const trigger = triggers.get(sourceId) || {};
    const items = trigger[sourceProp] || [];

    const item = items.find(i => i.targetId == targetId && i.property == targetProp);
    if (item != null) return;

    items.push({
        id: targetId,
        property: targetProp
    });

    trigger[sourceProp] = items;
    triggers.set(sourceId, trigger);
}

function link(sourceId, sourceProp, targetId, targetProp, value) {
    if (typeof value != "object" || value === null) {
        addUpdateOrigin(sourceId, sourceProp, targetId, targetProp);
        addUpdateOrigin(targetId, targetProp, sourceId, sourceProp);
    }

    addTriggers(sourceId, sourceProp, targetId, targetProp);
}

export const bindingData = {
    details: {data: data, callbacks: callbacks, updates: updates, triggers: triggers},

    link(sourceId, sourceProp, targetId, targetProp, value) {
        link(sourceId, sourceProp, targetId, targetProp, value);
    },

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
        const changed = property.indexOf(".") == -1 ? setProperty(obj, property, value) : setPropertyPath(obj, property, value);

        if (changed == true) {
            performUpdates(id, property, value);
            callFunctions(id, property);
            callTriggers(id, property);
        }
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