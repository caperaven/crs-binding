import {compileExp} from "./compiler.js"

export function enableEvents(obj) {
    obj.__events = new Map();
    obj.__conditions = new Map();
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
}

export function when(obj, exp, callback) {
    let functions = obj.__events.get(exp) || [];
    functions = [...functions, callback];
    obj.__events.set(exp, functions);

    const cmp = compileExp(exp);
    let cond = obj.__conditions.get(exp);
    if (cond == null) {
        const fn = () => {
            if (cmp.function(obj) == true) {
                for (let call of functions) {
                    call();
                }
            }
        };

        cond = {fn: fn, properties: cmp.parameters.properties.slice(0)};
        obj.__conditions.set(exp, cond);
    }

    const properties = cmp.parameters.properties;
    for (let property of properties) {
        crsbinding.events.on(obj, property, cond.fn);
    }
}

export function removeWhen(obj, exp, callback) {
    crsbinding.events.removeOn(obj, exp, callback);
    const cnd = obj.__conditions.get(exp);
    for (let property of cnd.properties) {
        crsbinding.events.removeOn(obj, property, cnd.fn);
    }

    delete cnd.fn;
    delete cnd.properties;
    obj.__conditions.delete(exp);
}

export function on(obj, property, callback) {
    if (obj == null || obj.__events == null) return;

    let functions = obj.__events.get(property) || [];
    functions = [...functions, callback];
    obj.__events.set(property, functions);
}

export function removeOn(obj, property, callback) {
    if (obj == null || obj.__events == null) return;

    const functions = obj.__events.get(property) || [];
    const index = functions.indexOf(callback);

    if (index != -1) {
        functions.splice(index, 1);
        obj.__events.set(property, functions);
    }

    if (functions.length == 0) {
        obj.__events.delete(property);
    }
}

export function notifyPropertyChanged(obj, property, args) {
    if (obj.__events == null || obj.__events.has(property) == false) return;

    callFunctions(obj.__events.get(property), obj, property, args);

    if (obj.__elEvents) {
        callFunctions(obj.__elEvents.get(property), obj, property, args);
    }

    const changedFnName = `${property}Changed`;
    if (obj[changedFnName] != null) {
        obj[changedFnName].call(obj, args);
    }
}

function callFunctions(functions, obj, property, args) {
    for(let fn of functions) {
        fn(property, obj[property], args);
    }
}