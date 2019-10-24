const PROXY = "_isProxy";

export function observeArray(obj) {
    obj[PROXY] = true;

    for (let i = 0; i < obj.length; i++) {
        obj[i] = crsbinding.observe(obj[i]);
        obj[i].__index = i;
    }

    const proxy = new Proxy(obj, {
        get: get
    });

    return proxy;
}

const deleteFunctions = ["pop", "slice"];
const addFunctions = ["push"];

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
    console.log(obj);
    console.log(items);
}

function itemsAdded(obj, items) {
    console.log(obj);
    console.log(items);
}