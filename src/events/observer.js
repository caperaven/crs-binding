import {observeArray, releaseObservedArray} from "./observe-array.js";

const PROXY = "__isProxy";
const BACKUP = "__backup";
const ISARRAY = "__isArray";
const PERSISTENT = "__persistent";

/**
 * Start observing an object for property changes.
 * This will turn the object into a proxy and enable events and conditions.
 * @param obj
 * @param prior
 * @returns {*}
 */
export function observe(obj, prior, persistent = false) {
    if (Array.isArray(obj)) return observeArray(obj, prior);

    // 1. Initialize the object
    crsbinding._objStore.add(obj, prior);
    obj[PROXY] = true;
    obj[BACKUP] = {};

    if (persistent === true) {
        obj[PERSISTENT] = true;
    }

    // 2. Make bindable properties observed
    const properties = obj.properties || Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") == -1 && item != "element" && item != "_element" && typeof obj[item] == "object");
    for (let property of properties) {
        const value = obj[property];
        if (value && value[PROXY] != true) {
            obj[property] = observe(obj[property], (prior || {})[property]);
        }
    }

    // 3. Create the proxy result
    const proxy = new Proxy(obj, {
        get: get,
        set: set
    });

    return proxy;
}

/**
 * Release a object's binding properties to clean up memory
 * @param obj: <any> object to release, must be a proxy
 * @param force: <boolean> force cleanup.
 */
export function releaseObserved(obj, force = false) {
    // 1. Redirect if an array or null
    if (obj == null) return;
    if (obj[ISARRAY] == true) return releaseObservedArray(obj);

    // 2 Is the object persistent if so don't clean up unless you force a cleanup
    if (obj[PERSISTENT] == true && force != true) {
        return;
    }

    // 3. Remove functions from store as it is no longer used
    crsbinding._objStore.remove(obj);

    // 4. If the object is disposable then dispose of it
    if (obj.dispose != null) {
        obj._disposing = true;
        obj.dispose();
    }

    // 5. Clean properties recursively
    const properties = Object.getOwnPropertyNames(obj).filter(item => excludeProperties.indexOf(item) == -1);
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
const excludeProperties = ["__bid", "__pbid", "__isProxy"];
/**
 * remove all the system properties as part of a clean up process.
 * @param obj
 */
function cleanSystemProperties(obj) {
    if (obj[PERSISTENT] === true) return;
    const properties = Object.getOwnPropertyNames(obj).filter(item => excludeProperties.indexOf(item) == -1);
    for (let property of properties) {
        if (property.indexOf("__") == 0) {
            delete obj[property];
        }
        else if (obj[property][PROXY] == true) {
            cleanSystemProperties(obj[property]);
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
    if (prop == "_disposing" || obj._disposing == true || obj[PROXY] != true) return true;

    // 1. Setting system fields
    if (prop.indexOf("__") != -1 || value instanceof HTMLElement) {
        obj[prop] = value;
    }
    // 2. Set actual values
    else {
        setSingle(obj, prop, value);
    }

    return true;
}

const excludeBackup = ["__isProxy", "element"];

function setSingle(obj, prop, value) {
    obj.__processing = true;

    // 1. Get state values
    const backup = obj[BACKUP] || {};
    const oldValue = obj[prop];

    // 2. Set the new value
    obj[prop] = createProxyValue(obj, prop, oldValue, value);

    // 3. Notify changes to listeners
    crsbinding.events.notifyPropertyChanged(obj, prop);

    if (obj.propertyChanged != null) {
        obj.propertyChanged(prop, value, oldValue);
    }

    if (value === null && oldValue && oldValue[PROXY] == true) {
        crsbinding.observation.releaseObserved(oldValue);
        backup && backup[prop] && releaseObserved(backup[prop]);
    }

    // 4. Release the old value
    else if (excludeBackup.indexOf(prop) == -1 && prop.indexOf("__") == -1 && oldValue != null) {

        if (Array.isArray(oldValue)) {
            crsbinding.observation.releaseObserved(oldValue);
        }
        else {
            // 4.1 release the previous backup item properly
            releaseObserved(backup[prop]);
            // 4.2 clean the system properties off the oldValue
            if (oldValue[PROXY] == true) {
                cleanSystemProperties(oldValue);
            }
            // 4.3 add the clean oldvalue to backup
            backup[prop] = oldValue;
        }
    }

    delete obj.__processing;
}

function createProxyValue(obj, property, oldValue, newValue) {
    if (newValue == null) return null;

    if (typeof newValue != "object") return newValue;

    // 1. initialize
    let result = newValue;

    // 2. if the value is not a proxy, make it one.
    if (newValue[PROXY] != true) {
        result = crsbinding.observation.observe(newValue, oldValue);
    }

    if (Array.isArray(result) == false) {
        const properties = Object.getOwnPropertyNames(result).filter(item => item.indexOf("__") == -1);
        for(let property of properties) {
            // note: this will cover objects and arrays as typeof [] = "object"
            if (typeof result[property] == "object" && result[property][PROXY] != true) {
                const nc = crsbinding.observation.observe(result[property], oldValue[property], oldValue[PERSISTENT]);
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