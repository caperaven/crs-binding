import {compileExp} from "./compiler.js"

/**
 * Register the condition on the object
 * @param obj
 * @param exp
 * @param callback
 */
export function when(obj, exp, callback) {
    // const storeItem = crsbinding._objStore.get(obj);
    //
    // let functions = storeItem.__events.get(exp) || [];
    // functions = [...functions, callback];
    // storeItem.__events.set(exp, functions);
    //
    // const cmp = compileExp(exp);
    // let cond = storeItem.__conditions.get(exp);
    // if (cond == null) {
    //     const fn = () => {
    //         if (cmp.function(obj) == true) {
    //             for (let call of functions) {
    //                 call();
    //             }
    //         }
    //     };
    //
    //     cond = {fn: fn, properties: cmp.parameters.properties.slice(0)};
    //     storeItem.__conditions.set(exp, cond);
    // }
    //
    // const properties = cmp.parameters.properties;
    // for (let property of properties) {
    //     crsbinding.events.on(obj, property, cond.fn);
    // }
}

/**
 * Remove the condition added during when
 * @param obj
 * @param exp
 * @param callback
 */
export function removeWhen(obj, exp, callback) {
    // const storeItem = crsbinding._objStore.get(obj, false);
    //
    // if (storeItem != null) {
    //     crsbinding.events.removeOn(storeItem, exp, callback);
    //     const cnd = storeItem.__conditions.get(exp);
    //     for (let property of cnd.properties) {
    //         crsbinding.events.removeOn(storeItem, property, cnd.fn);
    //     }
    //
    //     delete cnd.fn;
    //     delete cnd.properties;
    //     storeItem.__conditions.delete(exp);
    // }
}

/**
 * Set events for when a property changes
 * @param obj
 * @param property
 * @param callback
 */
export function on(obj, property, callback) {
    // const storeItem = crsbinding._objStore.get(obj);
    // if (storeItem == null) return;
    //
    // let functions = storeItem.__events.get(property) || [];
    // functions = [...functions, callback];
    // storeItem.__events.set(property, functions);
}

/**
 * Remove the events defined in On
 * @param obj
 * @param property
 * @param callback
 */
export function removeOn(obj, property, callback) {
    // const storeItem = crsbinding._objStore.get(obj, false);
    //
    // if (storeItem != null) {
    //     const functions = storeItem.__events.get(property) || [];
    //     const index = functions.indexOf(callback);
    //
    //     if (index != -1) {
    //         functions.splice(index, 1);
    //         storeItem.__events.set(property, functions);
    //     }
    //
    //     if (functions.length == 0) {
    //         storeItem.__events.delete(property);
    //     }
    // }
}
