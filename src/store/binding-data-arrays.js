export function createArrayProxy(array, id, property) {
    if (array == null) return null;

    array.__id = id;
    array.__property = property;

    return new Proxy(array, {get: get});
}

const deleteFunctions = ["pop", "splice"];
const addFunctions = ["push"];

function get(collection, property) {
    const value = collection[property];

    if (typeof value == "function") {
        return (...args) => {
            const result = collection[property](...args);

            if (deleteFunctions.indexOf(property) != -1) {
                itemsRemoved(collection, result);

                if (property == "splice" && args.length > 2) {
                    args = args.splice(2, args.length);
                    itemsAdded(collection, args);
                }
            }
            else if (addFunctions.indexOf(property) != -1) {
                itemsAdded(collection, args);
            }

            return result;
        }
    }

    return value;
}

function itemsRemoved(collection, items) {
    const id = collection.__id;
    const property = collection.__property;

    crsbinding.data.arrayItemsRemoved(id, property, items, collection);
}

function itemsAdded(collection, items) {
    const id = collection.__id;
    const property = collection.__property;

    crsbinding.data.arrayItemsAdded(id, property, items, collection);
}