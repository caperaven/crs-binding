/**
 * Binding data used for binding operations
 * @type {Map<any, any>}
 */
const data = new Map();

/**
 * Functions that trigger when properties change.
 * This updates the UI and performs binding operations as defined in the DOM
 * @type {Map<any, any>}
 */
const callbacks = new Map();

/**
 * When a object's value changes, copy that value to a update as defined in this map
 * @type {Map<any, any>}
 */
const updates = new Map();

/**
 * When this property changes, also update other UI by firing their triggers.
 * Items in the trigger array are related, if one changes, update the UI of all the triggers in the same group
 * @type {Map<any, any>}
 */
const triggers = new Map();

/**
 * Components and views need access to the actual class to execute delegates.
 * @type {Map<any, any>}
 */
const context = new Map();

let _nextId = 0;
let _nextTriggerId = 0;

function getNextId() {
    const id = _nextId;
    _nextId += 1;
    return id;
}

function getNextTriggerId() {
    const id = _nextTriggerId;
    _nextTriggerId += 1;
    return id;
}

function callFunctionsOnPath(id, path) {
    const obj = callbacks.get(id);

    const fn = new Function("context", `try {return context.${path}} catch {return null}`);
    const result =  fn(obj);

    callFunctionsOnObject(result, id, path);
}

function callFunctions(id, property) {
    if (property.indexOf(".") != -1) return callFunctionsOnPath(id, property);

    const obj = callbacks.get(id);
    if (obj[property] == null) return;
    callFunctionsOnObject(obj[property], id, property);
}

function callFunctionsOnObject(obj, id, property) {
    const functions = obj.functions;
    if (functions != null) {
        for(let fn of obj.functions) {
            const value = bindingData.getValue(id, property);
            fn(property, value);
        }
    }

    if (obj.trigger != null) {
        const triggerObj = triggers.get(obj.trigger);
        if (triggerObj.frozen != true) {
            triggerObj.frozen = true;
            for (let trigger of triggerObj.values) {
                crsbinding.data.updateUI(trigger.id, trigger.path);
            }
            delete triggerObj.frozen;
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

    callback && callback(cobj, parts[parts.length -1]);
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

function link(sourceId, sourceProp, targetId, targetProp, value) {
    if (typeof value != "object" || value === null) {
        addUpdateOrigin(sourceId, sourceProp, targetId, targetProp);
        addUpdateOrigin(targetId, targetProp, sourceId, sourceProp);
        syncValueTrigger(sourceId, sourceProp, targetId, targetProp);
    }
    else {
        syncTriggers(sourceId, sourceProp, targetId, targetProp);
    }
}

function syncValueTrigger(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = callbacks.get(sourceId);
    let targetObj = callbacks.get(targetId);

    const trigger = (new Function("context", `try {return context.${sourceProp}.trigger} catch {return null}`))(sourceObj);
    if (trigger != null) {
        targetObj[targetProp] = targetObj[targetProp] || {};
        targetObj[targetProp].trigger = trigger;

        const tr = triggers.get(trigger);
        tr.values.push({id: targetId, path: targetProp});
    }
}

// JHR: todo this needs to be updated so that the source prop and target prop can be paths
function syncTriggers(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = callbacks.get(sourceId);
    let targetObj = callbacks.get(targetId);

    const properties = Object.getOwnPropertyNames(sourceObj[sourceProp]).filter(fn => fn != "functions");
    for (let property of properties) {
        const source = sourceObj[sourceProp][property];

        if (source.trigger != null) {
            targetObj[targetProp] = targetObj[targetProp] || {};
            targetObj[targetProp][property] = targetObj[sourceProp][property] || {};
            targetObj[targetProp][property].trigger = source.trigger;

            const tr = triggers.get(source.trigger);
            tr.values.push({id: targetId, path: `${targetProp}.${property}`});
        }
    }
}

function makeShared(id, property, sharedItems) {
    const obj = callbacks.get(id);
    for (let prop of sharedItems) {
        const path = `${property}.${prop}`;
        ensurePath(obj, path, (tobj, tprop) => {
            if (tobj[tprop] == null) {
                tobj[tprop] = {};
            }

            const nextId = getNextTriggerId();
            triggers.set(nextId, { values: [{id: id, path: path}]});
            tobj[tprop].trigger = nextId;
        })
    }
}

export const bindingData = {
    details: {data: data, callbacks: callbacks, updates: updates, triggers: triggers, context:  context},

    link: link,

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

    addContext(id, obj) {
        context.set(id, obj);
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

    getContext(id) {
        return context.get(id);
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

    createReferenceTo: createReference,

    clear() {
        data.forEach((value, key) => {
            delete value.data;
        });
        data.clear();
        _nextId = 0;
    },

    makeShared: makeShared,

    updateUI: callFunctions
};