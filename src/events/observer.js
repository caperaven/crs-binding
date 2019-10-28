import {observeArray, releaseObservedArray} from "./observe-array.js";

const PROXY = "_isProxy";
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

    const proxy = new Proxy(obj, {
        get: get,
        set: set
    });

    return proxy;
}

export function releaseObserved(obj) {
    if (obj._isArray == true) return releaseObservedArray(obj);

    crsbinding.events.disableEvents(obj);

    if (obj.dispose != null) {
        obj._disposing = true;
        obj.dispose();
    }

    delete obj[PROXY];
    delete obj[BACKUP];
}

function get(obj, prop) {
    return obj[prop];
}

function set(obj, prop, value) {
    if (prop == "_disposing" || obj._disposing == true) return true;

    if (value != null && value.indexOf && value.indexOf(".") > 0) {
        return setOnPath(obj, prop, value);
    }
    else {
        return setSingle(obj, prop, value);
    }
}

function setSingle(obj, prop, value) {
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
        backup[prop] = oldValue;
    }

    return true;
}

function setOnPath(obj, prop, value) {
    return true;
}

function createProxyValue(origional, value) {
    if (origional && origional._isProxy == true) {
        if (value && value._isProxy != true) {
            return crsbinding.observation.observe(value, origional);
        }
    }
    return value;
}

function isProxy(obj) {
    return obj && typeof obj == "object" && obj[PROXY] == true;
}