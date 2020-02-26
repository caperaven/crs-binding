import {observeArray, releaseObservedArray} from "./observe-array.js";

const PROXY = "__isProxy";
const BACKUP = "__backup";

export function observe(obj, prior) {
    obj[PROXY] = true;
    crsbinding.events.enableEvents(obj);

    if (Array.isArray(obj)) return observeArray(obj);
    obj[BACKUP] = {};

    if (prior != null) {
        obj.__events = prior.__events;
        delete prior.__events;
    }

    const keys = Object.keys(obj);
    for (let key of keys) {
        if (Array.isArray(obj[key])) {
            obj[key] = observeArray(obj[key]);
        }
    }

    const proxy = new Proxy(obj, {
        get: get,
        set: set
    });

    return proxy;
}

export function releaseObserved(obj) {
    if (obj.__elEvents != null) return;
    if (obj.__isArray == true) return releaseObservedArray(obj);

    crsbinding.events.disableEvents(obj);

    if (obj.dispose != null) {
        obj._disposing = true;
        obj.dispose();
    }
    
    const properties = Object.getOwnPropertyNames(obj);
    for (let prop of properties) {
        if (prop.indexOf("__") == 0 || (prop.indexOf("Changed") != -1 && typeof obj[prop] == "function")) {
            delete obj[prop];
        }
        else if (obj[prop] && obj[prop][PROXY] == true) {
            releaseObserved(obj[prop]);
            delete obj[prop];
        }
    }
}

function get(obj, prop) {
    return obj[prop];
}

function set(obj, prop, value) {
    if (prop == "_disposing" || obj._disposing == true) return true;

    if (prop.indexOf("__") != -1) {
        obj[prop] = value;
    }
    else {
        setSingle(obj, prop, value);
    }

    return true;
}

const excludeBackup = ["__isProxy", "element"];

function setSingle(obj, prop, value) {
    obj.__processing = true;

    const backup = obj[BACKUP];
    const oldValue = obj[prop];

    obj[prop] = createProxyValue(obj[prop], value);

    crsbinding.events.notifyPropertyChanged(obj, prop);

    if (obj.propertyChanged != null) {
        obj.propertyChanged(value, oldValue);
    }

    if (isProxy(oldValue)) {
        releaseObserved(oldValue);
    }
    else {
        if (excludeBackup.indexOf(prop) == -1 && prop.indexOf("__") == -1) {
            backup[prop] = oldValue;
        }
    }

    delete obj.__processing;
}

function createProxyValue(origional, value) {
    if (value == null) return null;

    let result = value;

    if (origional && origional.__isProxy == true) {
        if (result && result.__isProxy != true) {
            result = crsbinding.observation.observe(result, origional);
        }
        else if (result && origional) {
            copyOverEvents(result, origional);
        }

        const properties = Object.getOwnPropertyNames(origional).filter(item => item.indexOf("__") == -1);
        for (let property of properties) {
            if (origional[property][PROXY] == true && result[property][PROXY] != true) {
                const nc = crsbinding.observation.observe(result[property], origional[property]);
                result.__processing = true;
                delete result[property];
                result[property] = nc;
                delete result.__processing;
            }
        }
    }

    return result;
}

function isProxy(obj) {
    return obj && typeof obj == "object" && obj[PROXY] == true;
}

function copyOverEvents(target, source) {
    target.__events = source.__events;
    delete source.__events;
}