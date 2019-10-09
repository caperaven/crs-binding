const PROXY = "_isProxy";
const BACKUP = "__backup";

export function observe(obj) {
    obj[PROXY] = true;
    obj[BACKUP] = {};

    crsbinding.enableEvents(obj);

    const proxy = new Proxy(obj, {
        get: get,
        set: set
    });

    return proxy;
}

export function releaseObserved(obj) {
    crsbinding.disableEvents(obj);

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

    const backup = obj[BACKUP];
    const oldValue = obj[prop];

    obj[prop] = value;

    obj.notifyPropertyChanged(prop);

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

function isProxy(obj) {
    return obj && typeof obj == "object" && obj[PROXY] == true;
}