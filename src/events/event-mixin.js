import {compileExp} from "./compiler.js"

export function enableEvents(obj) {
    obj.__events = new Map();
    obj.__conditions = new Map();
    obj.__computed = new Map();
}

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

export function when(obj, exp, callback) {
    const storeItem = crsbinding._objStore.get(obj);

    let functions = storeItem.__events.get(exp) || [];
    functions = [...functions, callback];
    storeItem.__events.set(exp, functions);

    const cmp = compileExp(exp);
    let cond = storeItem.__conditions.get(exp);
    if (cond == null) {
        const fn = () => {
            if (cmp.function(storeItem) == true) {
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
        crsbinding.events.on(storeItem, property, cond.fn);
    }
}

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

export function on(obj, property, callback) {
    const storeItem = crsbinding._objStore.get(obj);

    let functions = storeItem.__events.get(property) || [];
    functions = [...functions, callback];
    storeItem.__events.set(property, functions);
}

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

export function notifyPropertyChanged(obj, property, args) {
    const storeItem = crsbinding._objStore.get(obj, false);

    if (storeItem != null) {
        if (storeItem.__events.has(property) === true)
        {
            callFunctions(storeItem.__events.get(property), obj, property, args);
        }

        const changedFnName = `${property}Changed`;
        if (obj[changedFnName] != null) {
            obj[changedFnName].call(obj, args);
        }
    }
}

export function notifyPropertyOn(obj, property, triggerProperties) {
    const storeItem = crsbinding._objStore.get(obj, false);

    if (storeItem != null) {
        let fn = storeItem.__computed.get(property);
        if (fn == null) {
            fn = () => crsbinding.events.notifyPropertyChanged(storeItem, property);
            storeItem.__computed.set(property, fn);
        }

        for (let prop of triggerProperties) {
            crsbinding.events.listenOn(obj, prop, fn);
        }
    }
}

function callFunctions(functions, obj, property, args) {
    for(let fn of functions) {
        fn(property, obj[property], args);
    }
}