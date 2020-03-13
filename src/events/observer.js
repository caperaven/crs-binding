import {observeArray, releaseObservedArray} from "./observe-array.js";

const PROXY = "__isProxy";
const BACKUP = "__backup";
const PERSISTENT = "__persistent";
const ISARRAY = "__isArray";

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
    if (Array.isArray(obj)) return observeArray(obj, persistent);

    // 1. Initialize the object
    crsbinding._objStore.add(obj, prior);
    obj[PROXY] = true;
    obj[BACKUP] = {};
    obj[PERSISTENT] = persistent;

    // 2. Make bindable properties observed
    for (let property of obj.properties || []) {
        const value = obj[property];
        if (value && value[PROXY] != true) {
            obj[property] = observe(obj[property]);
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
 * if the object's __persistent field is true, it will not be released unless force is true.
 * This helps the system bypass persistent objects being used between multiple UI parts
 * @param obj: <any> object to release, must be a proxy
 * @param force: <boolean> force cleanup.
 */
export function releaseObserved(obj, force = false) {
    if (obj[PERSISTENT] == true && force != true) return;
    if (obj[ISARRAY] == true) return releaseObservedArray(obj, force);

    crsbinding._objStore.remove(obj);

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
    if (prop == "_disposing" || obj._disposing == true || obj[PROXY] != true) return true;

    // 1. Setting system fields
    if (prop.indexOf("__") != -1) {
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
    const backup = obj[BACKUP];
    const oldValue = obj[prop];

    // 2. Set the new value
    obj[prop] = createProxyValue(obj, prop, obj[prop], value);

    // 3. Notify changes to listeners
    crsbinding.events.notifyPropertyChanged(obj, prop);

    if (obj.propertyChanged != null) {
        obj.propertyChanged(prop, value, oldValue);
    }

    // 4. Release the old value
    if (isProxy(oldValue)) {
        releaseObserved(oldValue);
    }
    else {
        if (excludeBackup.indexOf(prop) == -1 && prop.indexOf("__") == -1 && oldValue != null) {
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

    // 2. this is not a bindable property so just return it
    if ((obj.properties || []).indexOf(property) == 1) {
        return result;
    }

    // 3. if the value is not a proxy, make it one.
    if (newValue[PROXY] != true) {
        result = crsbinding.observation.observe(newValue, oldValue);
    }

    // 4. if the old value is a proxy, copy over all the set all the proxy properties on the new object
    if (oldValue != null && oldValue[PROXY] == true) {
        // get all the field names that needs to be made in sync.
        // if the old value is null there is nothing to copy over.
        // if the new value is null there is no need to copy anything over
        const properties = (oldValue.properties || []).filter(fName => oldValue[fName] != null && result[fName] != null);
        for (let property of properties) {
            const nc = crsbinding.observation.observe(result[property], oldValue[property]);
            result.__processing = true;
            delete result[property];
            result[property] = nc;
            delete result.__processing;
        }
    }

    return result;
}

function isProxy(obj) {
    return obj && typeof obj == "object" && obj[PROXY] == true;
}