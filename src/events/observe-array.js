const PROXY = "_isProxy";
const ISARRAY = "_isArray";

export function observeArray(obj) {
    obj[ISARRAY] = true;

    if (obj._events == null) {
        crsbinding.events.enableEvents(obj);
    }

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
    if (items == null) return;
    crsbinding.events.notifyPropertyChanged(obj, "items-deleted", items);

    if (Array.isArray(items)) {
        for (let item of items) {
            itemRemoved(item);
        }
    }
    else {
        itemRemoved(items);
    }
}

function itemRemoved(item) {
    crsbinding.observation.releaseObserved(item);
}

function itemsAdded(obj, items) {
    if (items == null) return;
    const indexes = [];

    if (Array.isArray(items)) {
        for (let item of items) {
            itemAdded(obj, item, indexes);
        }
    }
    else {
        itemAdded(obj, items);
    }

    crsbinding.events.notifyPropertyChanged(obj, "items-added", {items: items, indexes: indexes});
}

function itemAdded(obj, item, indexes) {
    const index = obj.indexOf(item);
    indexes.push(index);
    obj[index] = crsbinding.observation.observe(item);
}