const PROXY = "__isProxy";
const ISARRAY = "__isArray";

export function observeArray(collection) {
    collection[ISARRAY] = true;

    if (collection._events == null) {
        crsbinding.events.enableEvents(collection);
    }

    collection.__nextId = 1;

    for (let i = 0; i < collection.length; i++) {
        observeIndex(collection, i);
    }

    const proxy = new Proxy(collection, {
        get: get
    });

    return proxy;
}

export function releaseObservedArray(collection) {
    crsbinding.events.disableEvents(collection);
    collection.forEach(item => crsbinding.observation.releaseObserved(item));
}

const deleteFunctions = ["pop", "splice"];
const addFunctions = ["push"];

function get(collection, prop) {
    const value = collection[prop];

    if (typeof value == "function") {
        return (...args) => {
            const result = collection[prop](...args);

            if (deleteFunctions.indexOf(prop) != -1) {
                itemsRemoved(collection, result);

                if (prop == "splice" && args.length > 2) {
                    args = args.splice(2, args.length);
                    itemsAdded(collection, args);
                }
            }
            else if (addFunctions.indexOf(prop) != -1) {
                itemsAdded(collection, args);
            }

            return result;
        }
    }

    return value;
}

function itemsRemoved(collection, items) {
    if (items == null) return;
    crsbinding.events.notifyPropertyChanged(collection, "items-deleted", items);

    if (Array.isArray(items)) {
        for (let item of items) {
            crsbinding.observation.releaseObserved(item);
        }
    }
    else {
        crsbinding.observation.releaseObserved(items);
    }
}

function itemsAdded(obj, items) {
    if (items == null) return;

    const payload = {
        items: [],
        indexes: []
    };

    for (let item of items) {
        const index = obj.indexOf(item);

        observeIndex(obj, index);

        payload.items.push(item);
        payload.indexes.push(index);
    }

    crsbinding.events.notifyPropertyChanged(obj, "items-added", payload);
}

function observeIndex(collection, index) {
    const item = collection[index];
    if (item.__isProxy != true) {
        item.__uid = collection.__nextId;
        collection.__nextId++;
        collection[index] = crsbinding.observation.observe(item);
    }
}