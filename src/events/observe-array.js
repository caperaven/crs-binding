const PROXY = "_isProxy";
const ISARRAY = "_isArray";

export function observeArray(obj) {
    obj[ISARRAY] = true;

    for (let i = 0; i < obj.length; i++) {
        obj[i] = crsbinding.observation.observe(obj[i]);
        obj[i].__index = i;
    }

    const proxy = new Proxy(obj, {
        get: get
    });

    return proxy;
}

export function releaseObservedArray(obj) {
    crsbinding.events.disableEvents(obj);
    obj.forEach(item => crsbinding.observation.releaseObserved(item));
}

const deleteFunctions = ["pop", "slice", "splice"];
const addFunctions = ["push"];

// ------- TODO ---------
// JHR: todo: splice also adds, but how do you know what was added??

function get(obj, prop) {
    const value = obj[prop];

    if (typeof value == "function") {
        return (...args) => {
            const result = obj[prop](...args);

            if (deleteFunctions.indexOf(prop) != -1) {
                itemsRemoved(obj, result);
            }
            else if (addFunctions.indexOf(prop) != -1) {
                itemsAdded(obj, args);
            }

            return result;
        }
    }

    return value;
}

function itemsRemoved(obj, items) {
    crsbinding.events.notifyPropertyChanged(obj, "items-deleted", items);
    for (let item of items) {
        crsbinding.observation.releaseObserved(item);
    }
}

function itemsAdded(obj, items) {
    const indexes = [];

    for (let item of items) {
        const index = obj.indexOf(item);
        indexes.push(index);
        obj[index] = crsbinding.observation.observe(item);
    }

    crsbinding.events.notifyPropertyChanged(obj, "items-added", {items: items, indexes: indexes});
}