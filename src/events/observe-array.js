const PROXY = "__isProxy";
const ISARRAY = "__isArray";

export function observeArray(collection, persistent = false) {
    if(collection[PROXY] === true) {
        return observeItems(collection);
    }

    collection[ISARRAY] = true;
    collection[PROXY] = true;

    crsbinding._objStore.add(collection);

    collection.__nextId = 1;
    collection.__persistent = persistent;

    observeItems(collection);

    return new Proxy(collection, {
        get: get
    });
}

function observeItems(collection) {
    for (let i = 0; i < collection.length; i++) {
        observeIndex(collection, i);
    }
    return collection;
}

export function releaseObservedArray(collection, force = false) {
    crsbinding.events.disableEvents(collection);
    collection.forEach(item => crsbinding.observation.releaseObserved(item, force));
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

        let observed = observeIndex(obj, index);

        payload.items.push(observed);
        payload.indexes.push(index);
    }

    crsbinding.events.notifyPropertyChanged(obj, "items-added", payload);
}

function observeIndex(collection, index) {
    const item = collection[index];
    item.__uid = collection.__nextId;
    collection.__nextId++;
    if (item.__isProxy != true) {
        collection[index] = crsbinding.observation.observe(item, null, collection.__persistent);
    }
    return collection[index];
}