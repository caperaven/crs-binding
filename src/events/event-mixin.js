import {compileExp} from "./compiler.js"

/**
 * enable events
 * @param obj
 */
export function enableEvents(obj) {
    obj.__events = new Map();
    obj.__conditions = new Map();
    obj.__computed = new Map();
}

/**
 * disable events
 * @param obj
 */
export function disableEvents(obj) {
    if (obj.__events != null) {
        obj.__events.forEach((ev) => {
           ev.length = 0;
        });
        obj.__events.clear();
        delete obj.__events;
    }

    if (obj.__conditions) {
        obj.__conditions.forEach((cnd) => {
            delete cnd.fn;
            delete cnd.properties;
        });
        obj.__conditions.clear();
        delete obj.__conditions;
    }
    
    if (obj.__computed) {
        obj.__computed.forEach((cnd) => {
            delete cnd.fn;
        })
    }
}

/**
 * Register the condition on the object
 * @param obj
 * @param exp
 * @param callback
 */
export function when(obj, exp, callback) {
    const storeItem = crsbinding._objStore.get(obj);

    let functions = storeItem.__events.get(exp) || [];
    functions = [...functions, callback];
    storeItem.__events.set(exp, functions);

    const cmp = compileExp(exp);
    let cond = storeItem.__conditions.get(exp);
    if (cond == null) {
        const fn = () => {
            if (cmp.function(obj) == true) {
                for (let call of functions) {
                    call();
                }
            }
        };

        cond = {fn: fn, properties: cmp.parameters.properties.slice(0)};
        storeItem.__conditions.set(exp, cond);
    }

    const properties = cmp.parameters.properties;
    for (let property of properties) {
        crsbinding.events.on(obj, property, cond.fn);
    }
}

/**
 * Remove the condition added during when
 * @param obj
 * @param exp
 * @param callback
 */
export function removeWhen(obj, exp, callback) {
    const storeItem = crsbinding._objStore.get(obj, false);

    if (storeItem != null) {
        crsbinding.events.removeOn(storeItem, exp, callback);
        const cnd = storeItem.__conditions.get(exp);
        for (let property of cnd.properties) {
            crsbinding.events.removeOn(storeItem, property, cnd.fn);
        }

        delete cnd.fn;
        delete cnd.properties;
        storeItem.__conditions.delete(exp);
    }
}

/**
 * Set events for when a property changes
 * @param obj
 * @param property
 * @param callback
 */
export function on(obj, property, callback) {
    const storeItem = crsbinding._objStore.get(obj);

    let functions = storeItem.__events.get(property) || [];
    functions = [...functions, callback];
    storeItem.__events.set(property, functions);
}

/**
 * Remove the events defined in On
 * @param obj
 * @param property
 * @param callback
 */
export function removeOn(obj, property, callback) {
    const storeItem = crsbinding._objStore.get(obj, false);

    if (storeItem != null) {
        const functions = storeItem.__events.get(property) || [];
        const index = functions.indexOf(callback);

        if (index != -1) {
            functions.splice(index, 1);
            storeItem.__events.set(property, functions);
        }

        if (functions.length == 0) {
            storeItem.__events.delete(property);
        }
    }
}

/**
 * Notify that property has changed
 * @param obj: object that change happened on
 * @param property: name of property that changed
 * @param args: this is used in array notifications for added and removed items
 */
export function notifyPropertyChanged(obj, property, args) {
    propertyChangedById(obj.__bid, obj, property, args);
}

function propertyChangedById(id, obj, property, args, processParentBinding = true) {
    // 1. Get store item
    const storeItem = crsbinding._objStore._store.get(id);
    if (storeItem == null) return;

    // 2. Call core update functions
    if (storeItem.__events.has(property) === true) {
        callFunctions(storeItem.__events.get(property), obj, property, args);
    }

    // 3. Call property changed function if it exists
    const changedFnName = `${property}Changed`;
    if (obj[changedFnName] != null) {
        obj[changedFnName].call(obj, args);
    }

    // 4. Get the references and call their functions
    if (processParentBinding == true) {
        let references = storeItem.__references || [];

        if (obj.__pbid) {
            let parentItem = crsbinding._objStore._store.get(obj.__pbid);
            references = [...references, ...parentItem.__references || []];
        }

        for (let refId of references) {
            propertyChangedById(refId, obj, property, args, false)
        }
    }
}

/**
 * Used for calculated properties
 * @param obj: object that notify happens on
 * @param property: the calculated property
 * @param triggerProperties: array of field names that causes the refresh of the above property binding.
 */
export function notifyPropertyOn(obj, property, triggerProperties) {
    const storeItem = crsbinding._objStore.get(obj, false);

    if (storeItem != null) {
        let fn = storeItem.__computed.get(property);
        if (fn == null) {
            fn = () => crsbinding.events.notifyPropertyChanged(obj, property);
            storeItem.__computed.set(property, fn);
        }

        for (let prop of triggerProperties) {
            crsbinding.events.listenOn(obj, prop, fn);
        }
    }
}

/**
 * Execute the given functions
 * @param functions: functions to execute
 * @param obj: context object
 * @param property: property that changed
 * @param args: used during array notification for items added or removed
 */
function callFunctions(functions, obj, property, args) {
    for(let fn of functions) {
        fn(property, obj[property], args);
    }
}