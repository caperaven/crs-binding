/**
 * Listen for property changes on a given context and property path
 * @param context {number} context id
 * @param property {string} property path that you want to listen on
 * @param callback {function} the callback to execute when the property changes
 * @returns {array} array defining cleanup properties for when you need to remove it.
 */
export function listenOnPath(context, property, callback) {
    const collection = Array.isArray(property) == true ? property : [property];
    const cleanEvents = [];

    for (let p of collection) {
        if (p.indexOf("$globals.") != -1) {
            context = crsbinding.$globals;
            addCleanUp(cleanEvents, crsbinding.$globals, p, callback);
        }

        addCallback(context, p, callback, cleanEvents);
    }

    return cleanEvents;
}

/**
 * Use the collection passed on during listenOnPath to clean up those items
 * @param itemsToRemove {array}
 */
export function removeOnPath(itemsToRemove) {
    for (let item of itemsToRemove) {
        crsbinding.data.removeCallback(item.context, item.path, item.callback);
        delete item.context;
        delete item.path;
        delete item.callback;
    }
    itemsToRemove.length = 0;
}

/**
 *
 * @param context {number} context id
 * @param path {string} property path that you want to listen on
 * @param callback {function} the callback to execute when the property changes
 * @param cleanEvents {array} array to populate with objects to use for cleanup
 */
function addCallback(context, path, callback, cleanEvents) {
    crsbinding.data.addCallback(context, path, callback);
    addCleanUp(cleanEvents, context, path.split("$parent.").join("").split("$context.").join(""), callback);
}

/**
 * Helper function that creates the cleanup object and add it to a given collection
 * @param collection {array} collection to add the objects too
 * @param context {number} the context id
 * @param path {string} property path that you want to listen on
 * @param callback {function} the callback to execute when the property changes
 */
function addCleanUp(collection, context, path, callback) {
    collection.push({
        context: context,
        path: path,
        callback: callback
    });
}