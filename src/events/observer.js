import {observeArray, releaseObservedArray} from "./observe-array.js";

const PROXY = "__isProxy";
const BACKUP = "__backup";

/**
 * Start observing an object for property changes.
 * This will turn the object into a proxy and enable events and conditions.
 * Mark the object as persistent using the persistent parameter if you don't want it to be cleaned when replaced with another objects.
 * @param obj
 * @param prior
 * @param persistent
 * @returns {*}
 */
export function observe(obj, prior, persistent = false) {
    obj[PROXY] = true;
    crsbinding.events.enableEvents(obj);

    if (Array.isArray(obj)) return observeArray(obj, persistent);
    obj[BACKUP] = {};

    if (prior != null) {
        obj.__events = prior.__events;
        delete prior.__events;
    }

    obj.__persistent = persistent;

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

/**
 * Release a object's binding properties to clean up memory
 * if the object's __persistent field is true, it will not be released unless force is true.
 * This helps the system bypass persistent objects being used between multiple UI parts
 * @param obj: <any> object to release, must be a proxy
 * @param force: <boolean> force cleanup.
 */
export function releaseObserved(obj, force = false) {
    if (obj.__persistent == true && force != true) return;

    if (obj.__isArray == true) return releaseObservedArray(obj, force);

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

/**
 * Standard get function for proxy actions
 * @param obj
 * @param prop
 * @returns {*}
 */
function get(obj, prop) {
    return obj[prop];
}

/**
 * Standard set operation for proxy actions
 * @param obj
 * @param prop
 * @param value
 * @returns {boolean}
 */
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
        // Need to put a marker to say DON"T RELEASE THIS YET
        releaseObserved(oldValue);
    }
    else {
        if (excludeBackup.indexOf(prop) == -1 && prop.indexOf("__") == -1 && oldValue != null) {
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

        // Process properties and make them observed if they are required.
        // Used to ensure object path bindings.
        if (Array.isArray(value) != true) {
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
    }

    return result;
}

function isProxy(obj) {
    return obj && typeof obj == "object" && obj[PROXY] == true;
}

function copyOverEvents(target, source) {
    /**
     * In some cases like using a item between a list and a bindable element, you need to maintain the origional events.
     * Only copy events over in cases when it is null because those are the cases where you have a single use case.
     * The __events object is removed on releasing of the old object.
     */
    if (target.__events == null) {
        target.__events = source.__events;
        delete source.__events;
    }
}