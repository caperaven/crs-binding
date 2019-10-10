import {compileExp} from "./compiler.js"

export function enableEvents(obj) {
    obj.__events = new Map();
    obj.__conditions = new Map();

    obj.when = when;
    obj.on = on;
    obj.notifyPropertyChanged = notifyPropertyChanged;

    obj.removeOn = removeOn;
    obj.removeWhen = removeWhen;
}

export function disableEvents(obj) {
    if (obj.__events != null) {
        obj.__events.clear();
        delete obj.__events;
    }

    obj.__conditions.forEach((cnd) => {
        delete cnd.fn;
        delete cnd.properties;
    });
    obj.__conditions.clear();
    delete obj.__conditions;

    delete obj.when;
    delete obj.on;
    delete obj.notifyPropertyChanged;
}

function when(exp, callback) {
    let functions = this.__events.get(exp) || [];
    functions = [...functions, callback];
    this.__events.set(exp, functions);

    const cmp = compileExp(exp);
    let cond = this.__conditions.get(exp);
    if (cond == null) {
        const fn = () => {
            if (cmp.function(this) == true) {
                for (let call of functions) {
                    call();
                }
            }
        };

        cond = {fn: fn, properties: cmp.parameters.properties.slice(0)};
        this.__conditions.set(exp, cond);
    }

    const properties = cmp.parameters.properties;
    for (let property of properties) {
        this.on(property, cond.fn);
    }
}

function removeWhen(exp, callback) {
    this.removeOn(exp, callback);
    const cnd = this.__conditions.get(exp);
    for (let property of cnd.properties) {
        this.removeOn(property, cnd.fn);
    }

    delete cnd.fn;
    delete cnd.properties;
    this.__conditions.delete(exp);
}

function on(property, callback) {
    let functions = this.__events.get(property) || [];
    functions = [...functions, callback];
    this.__events.set(property, functions);
}

function removeOn(property, callback) {
    const functions = this.__events.get(property) || [];
    const index = functions.indexOf(callback);

    if (index != -1) {
        functions.splice(index, 1);
    }

    if (functions.length == 0) {
        this.__events.delete(property);
    }
}

function notifyPropertyChanged(property) {
    if (this.__events.has(property) == false) return;

    const functions = this.__events.get(property);
    for(let fn of functions) {
        fn(property, this[property]);
    }
}