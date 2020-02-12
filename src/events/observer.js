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
    if (obj.__isArray == true) return releaseObservedArray(obj);

    crsbinding.events.disableEvents(obj);
    
    const keys = Object.keys(obj);
    for (let key of keys) {
        if (Array.isArray(obj[key])) {
            releaseObservedArray(obj[key]);
        }
    }
    
    if (obj.dispose != null) {
        obj._disposing = true;
        obj.dispose();
    }
    
    const properties = Object.getOwnPropertyNames(obj);
    for (let prop of properties) {
        if (prop.indexOf("Changed") != -1 && typeof obj[prop] == "function") {
            delete obj[prop];
        }
    }

    delete obj[PROXY];
    delete obj[BACKUP];
}

function get(obj, prop) {
    return obj[prop];
}

function set(obj, prop, value) {
    if (prop == "_disposing" || obj._disposing == true || obj.__processing == true) return true;

    setSingle(obj, prop, value);

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

    obj.__processing = false;
}

function createProxyValue(origional, value) {
    if (origional && origional.__isProxy == true) {
        if (value && value.__isProxy != true) {
            return crsbinding.observation.observe(value, origional);
        }
        else if (value && origional) {
            value.__events = origional.__events;
            delete origional.__events;
        }
    }
    return value;
}

function isProxy(obj) {
    return obj && typeof obj == "object" && obj[PROXY] == true;
}