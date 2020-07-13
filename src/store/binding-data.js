import {getValueOnPath} from "./../lib/path-utils.js";
import {createArrayProxy} from "./binding-data-arrays.js";

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

const idStore = {
    nextId: 0,
    nextTriggerId: 0,
    nextArrayId: 0
};


function getNextId() {
    return nextId("nextId");
}

function getNextTriggerId() {
    return nextId("nextTriggerId");
}

function nextArrayId() {
    return nextId("nextArrayId");
}

function nextId(idVariable) {
    const id = idStore[idVariable];
    idStore[idVariable] += 1;
    return id;
}

function callFunctionsOnPath(id, path) {
    const obj = callbacks.get(id);
    const result =  getValueOnPath(obj, path);
    if (result != null) {
        callFunctionsOnObject(result, id, path);
    }
}

function callFunctions(id, property) {
    if (typeof id == "object") {
        id = id.__uid || id._dataId;
    }

    const obj = callbacks.get(id);

    if (property == null) {
        const properties = getOwnProperties(obj);
        for (let prop of properties) {
            callFunctionsOnObject(obj[prop], id, prop);
        }
    }
    else {
        if (property.indexOf(".") != -1) return callFunctionsOnPath(id, property);

        if (obj == null) return;
        if (obj[property] == null) return;
        callFunctionsOnObject(obj[property], id, property);
    }
}

function callFunctionsOnObject(obj, id, property) {
    const functions = obj.__functions;
    if (functions != null) {
        for(let fn of obj.__functions) {
            const value = bindingData.getValue(id, property);
            fn(property, value);
        }
    }

    if (obj.__trigger != null) {
        const triggerObj = triggers.get(obj.__trigger);
        if (triggerObj.frozen != true) {
            triggerObj.frozen = true;
            for (let trigger of triggerObj.values) {
                if (trigger.id == id && trigger.path == property) continue;
                crsbinding.data.updateUI(trigger.id, trigger.path);
            }
            delete triggerObj.frozen;
        }
    }

    const properties = getOwnProperties(obj);
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
    obj[property].__functions = obj[property].__functions || [];
    obj[property].__functions.push(callback);
}

function removeGlobalsCallback(path, callback) {
    const obj = callbacks.get(crsbinding.$globals);
    const property = getValueOnPath(obj, path);

    if (property.__functions) {
        const index = property.__functions.indexOf(callback);
        if (index != -1) {
            property.__functions.splice(index, 1);

            if (property.__functions.length == 0) {
                delete property.__functions;
            }
        }
    }
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
    if (obj[property] !== value) {
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
    return getValueOnPath(obj, path);
}

function createReference(refId, name, path, index) {
    const id = getNextId();

    const ref = {
        id: id,
        name: name,
        type: "ref",
        refId: refId,
        path: path
    };

    if (index !== undefined) {
        ref.aId = index;
    }

    data.set(id, ref);
    callbacks.set(id, {});
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

function linkToArrayItem(id, path, itemId) {
    let sourceObj = getValueOnPath(callbacks.get(id), path);
    if (sourceObj == null) return;

    let targetObj = callbacks.get(itemId);

    const properties = getOwnProperties(sourceObj);
    for (let property of properties) {
        copyTriggers(sourceObj, property, targetObj, property, itemId, property);
    }
}

function unlinkArrayItem(object) {
    const clbObj = callbacks.get(object.__uid);
    removeTriggersOnCallbacks(clbObj, object.__uid);
}

function removeTriggersOnCallbacks(obj, id) {
    const properties = getOwnProperties(obj);
    for (let property of properties) {
        const trigger = obj[property].__trigger;
        if (trigger != null) {
            delete obj[property].__trigger;
            removeTriggersOnTriggers(id, trigger);
        }

        if (typeof obj[property] == "object") {
            removeTriggersOnCallbacks(obj[property]);
        }
    }
}

function removeTriggersOnTriggers(id, triggerId) {
    const obj = triggers.get(triggerId);
    const items = obj.values.filter(item => item.id == id)
    for (let item of items) {
        const index = obj.values.indexOf(item);
        obj.values.splice(index, 1);
    }
}

function syncValueTrigger(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = callbacks.get(sourceId);
    let targetObj = callbacks.get(targetId);

    const trigger = getValueOnPath(sourceObj, `${sourceProp}.__trigger`);
    if (trigger != null) {
        targetObj[targetProp] = targetObj[targetProp] || {};
        targetObj[targetProp].__trigger = trigger;

        const tr = triggers.get(trigger);
        tr.values.push({id: targetId, path: targetProp});
    }
}

function syncTriggers(sourceId, sourceProp, targetId, targetProp) {
    let sourceObj = callbacks.get(sourceId);
    let targetObj = callbacks.get(targetId);

    if (sourceProp.indexOf(".") == -1) {
        copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetProp);
    }
    else {
        ensurePath(targetObj, targetProp, (obj, prop) => {
            obj[prop] = obj[prop] || {};
            const parts = sourceProp.split(".");
            const sp = parts[parts.length -1];  // source property
            const np = parts.splice(0, parts.length -1).join(); // new Path
            const so = getValueOnPath(sourceObj, np); // source object
            copyTriggers(so, sp, obj, prop, targetId, targetProp);
        });
    }
}

function setArrayEvents(id, path, itemsAddedCallback, itemsDeletedCallback) {
    const cbObj = callbacks.get(id);

    ensurePath(cbObj, path, (obj, property) => {
        obj[property] = obj[property] || {};

        obj[property].__itemsAdded = obj[property].itemsAdded || [];
        obj[property].__itemsAdded.push(itemsAddedCallback);

        obj[property].__itemsDeleted = obj[property].itemsDeleted || [];
        obj[property].__itemsDeleted.push(itemsDeletedCallback);
    });
}

function copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetPath) {
    const source = sourceObj[sourceProp];
    const target = targetObj[targetProp] = targetObj[targetProp] || {};

    if (source.__trigger != null) {
        target.__trigger = source.__trigger;

        const tr = triggers.get(source.__trigger);
        tr.values.push({id: targetId, path: targetPath});
    }

    const properties = getOwnProperties(source);
    for (let property of properties) {
        copyTriggers(source, property, target, property, targetId, `${targetPath}.${property}`);
    }
}

function getOwnProperties(obj) {
    return Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == -1)
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
            tobj[tprop].__trigger = nextId;
        });
    }
}

function notifyArrayItemsAdded(collection, items) {
    crsbinding.data.arrayItemsAdded(collection.__id, collection.__property, Array.isArray(items) ? items: [items], collection);
}

function notifyArrayItemsRemoved(collection, items) {
    crsbinding.data.arrayItemsRemoved(collection.__id, collection.__property, Array.isArray(items) ? items: [items], collection);
}


function arrayItemsAdded(id, prop, items, collection) {
    const obj = callbacks.get(id);
    const clbObj = getValueOnPath(obj, prop);

    for (let callback of clbObj.__itemsAdded || []) {
        callback(items, collection);
    }
}

function arrayItemsRemoved(id, prop, items, collection) {
    const obj = callbacks.get(id);
    const clbObj = getValueOnPath(obj, prop);
    for (let callback of clbObj.__itemsDeleted || []) {
        callback(items, collection);
    }
}

function removeObject(id) {
    context.delete(id);

    removeData(id);
    removeCallbacks(id);
    removeUpdates(id);
    removeTriggers(id);
}

function removeData(id) {
    removeReferences(id);
    data.delete(id);
    if (data.size == 0) {
        idStore.nextId = 0;
        idStore.nextArrayId = 0;
    }
}

function removeReferences(parentId) {
    const references = Array.from(data).filter(item => item[1].refId == parentId);
    for (let ref of references) {
        removeObject(ref[1].id);
    }
}

function removeCallbacks(id) {
    callbacks.delete(id);
}

function removeUpdates(id) {
    const remove = Array.from(updates).filter(item => item[0] == id || (item[1].value && item[1].value.originId == id));
    for (let rem of remove) {
        updates.delete(rem[0]);
    }
}

function removeTriggers(id) {
    const tr = Array.from(triggers);
    for (let trigger of tr) {
        const index = trigger[1].values.findIndex(item => item.id == id);
        if (index != -1) {
            trigger[1].values.splice(index, 1);

            if (trigger.values.length == 0) {
                triggers.delete(trigger[0]);
            }
        }
    }

    if (triggers.size == 0) {
        idStore.nextTriggerId = 0;
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

    removeObject: removeObject,

    addContext(id, obj) {
        context.set(id, obj);
    },

    addCallback(id, property, callback) {
        const obj = callbacks.get(id);
        return property.indexOf(".") == -1 ? addCallback(obj, property, callback) : addCallbackPath(obj, property, callback);
    },

    setProperty(id, property, value, ctxName, dataType) {
        if (typeof id == "object") {
            id = id.__uid || id._dataId;
        }

        let obj = data.get(id);

        if (dataType == "boolean" || typeof value === "boolean") {
            value = Boolean(value);
        }
        else if (dataType == "number" || (dataType == null && typeof value !== "object" && isNaN(value) == false)) {
            value = Number(value);
        }

        if (obj.type == "data") {
            obj = data.get(id).data;
            const changed = property.indexOf(".") == -1 ? setProperty(obj, property, value) : setPropertyPath(obj, property, value);

            if (changed == true) {
                performUpdates(id, property, value);
                callFunctions(id, property);
            }
        }
        else {
            this.setReferenceValue(id, property, value, obj.refId, obj.path, obj.aId, ctxName);
        }
    },

    /**
     * Get either the value as defined by the property and id pair
     * or get the object by just defining the id.
     * @param id {number} id of the data object to use, see _dataId on component
     * @param property {string} optional - path to the property
     * @returns {value}
     */
    getValue(id, property) {
        if (typeof id == "object") {
            id = id.__uid || id._dataId;
        }

        const obj = data.get(id);

        if (obj.type == "data") {
            const data = obj.data;
            if (property == null) return data;
            return property.indexOf(".") == -1 ? getProperty(data, property) : getPropertyPath(data, property);
        }
        else {
            const refId = obj.refId;
            return this.getReferenceValue(refId, property, obj.path, obj.aId);
        }
    },

    getContext(id) {
        return context.get(id);
    },

    getReferenceValue(id, property, path, aId) {
        const obj = data.get(id);

        if (obj.type == "data") {
            if (aId === undefined) {
                const p = property == null ? path : `${path}.${property}`;
                return this.getValue(id, p);
            }
            else {
                const ar = this.getValue(id, path);

                let result;

                if (Array.isArray(ar)) {
                    result = ar.find(i => i.__aId == aId);
                }
                else {
                    const item = ar.get(aId);
                    result = {key: aId, value: item};
                }
                // TODO GM: Investigate why result empty. Fix in phase 7.
                return property == null || result == null ? result : getValueOnPath(result, property);
            }
        }
        else {
            let pString = `${obj.path}.${path}`; // subObj.field1
            return this.getReferenceValue(obj.refId, property, pString)
        }
    },

    setReferenceValue(id, property, value, refId, refPath, refaId, ctxName) {
        const obj = data.get(refId);

        if (obj.type == "data") {
            let v = getValueOnPath(obj.data, refPath);

            if (refaId != null) {
                v = v.find(i => i.__aId == refaId);
            }

            if (ctxName != "context") {
                property = property.split(`${ctxName}.`).join("");
            }

            setPropertyPath(v, property, value);
            callFunctionsOnPath(id, property);
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
        idStore.nextId = 0;
        idStore.nextArrayId = 0;
    },

    makeShared: makeShared,

    updateUI: callFunctions,

    array(id, property) {
        if (typeof id == "object") {
            id = id._dataId;
        }

        const value = this.getValue(id, property);
        return createArrayProxy(value, id, property);
    },

    setArrayEvents: setArrayEvents,
    notifyArrayItemsAdded: notifyArrayItemsAdded,
    notifyArrayItemsRemoved: notifyArrayItemsRemoved,
    arrayItemsAdded: arrayItemsAdded,
    arrayItemsRemoved: arrayItemsRemoved,
    linkToArrayItem: linkToArrayItem,
    unlinkArrayItem: unlinkArrayItem,
    nextArrayId: nextArrayId,

    removeGlobalsCallback: removeGlobalsCallback
};