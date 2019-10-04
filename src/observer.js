const PROXY = "_isProxy";
const BACKUP = "__backup";

export function observe(obj) {
    Reflect.set(obj, PROXY, true);
    Reflect.set(obj, BACKUP, {});

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
    return Reflect.get(obj, prop);
}

function set(obj, prop, value) {
    if (obj._disposing == true) return false;

    const backup = Reflect.get(obj, BACKUP);
    const oldValue = Reflect.get(obj, prop);

    Reflect.set(obj, prop, value);

    if (obj.propertyChanged != null) {
        obj.propertyChanged(value, oldValue);
    }

    if (isProxy(oldValue)) {
        releaseObserved(oldValue);
    }
    else {
        Reflect.set(backup, prop, oldValue);
    }

    return true;
}

function isProxy(obj) {
    return obj && typeof obj == "object" && Reflect.get(obj, PROXY) == true;
}