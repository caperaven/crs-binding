import {getValueOnPath} from "./../lib/path-utils.js";
import {createArrayProxy} from "./binding-data-arrays.js";

export class BindingData {
    constructor() {
        this._data = {};
        this._converters = {};
        this._callbacks = {};
        this._updates = new Map();
        this._triggers = new Map();
        this._context = new Map();
        this._sync = new Map();
        this._frozenObjects = [];
        this._idStore = {
            nextId: 0,
            nextTriggerId: 0,
            nextArrayId: 0,
            nextSyncId: 0
        };
    }

    /**
     * Get the value converter for a given key.
     * @param key
     * @returns {null|converter}
     * @private
     */
    getConverter(id, path) {
        const obj = this._converters[id];
        if (obj == null) return null;

        const key = getValueOnPath(obj, path);
        if (key == null) return null;
        return crsbinding.valueConvertersManager.get(key);
    }

    /**
     * It's more convenient to use "this" instead of "this._dataId".
     * We want to cater for both so this function makes sense how to get the right context id for further use.
     * @param id {number|object} the context id to use or a object that contains either _dataId or __uid field.
     * @returns {number|*}
     * @private
     */
    _getContextId(id) {
        if (typeof id == "object") {
            return id.__uid || id._dataId;
        }
        return id;
    }

    /**
     * Get the context object
     * @param id {number} context id
     * @returns {object}
     */
    getContext(id) {
        return this._context.get(id);
    }

    /**
     * Get the array proxy based on the context id and property path
     * @param id {number} context id
     * @param property {string} property path
     * @returns {null|*}
     */
    array(id, property) {
        id = this._getContextId(id);

        const value = this.getValue(id, property);
        return createArrayProxy(value, id, property);
    }

    /**
     * Set the name value of a context object for debugging purposes
     * @param id {number} context id
     * @param name {string} the name to set on that context object
     */
    setName(id, name) {
        this._data[id].name = name;
    }

    /**
     * Create a binding context data object.
     * This is the starting point for all bindable context objects
     * @param name {string} debug name to use
     * @param type {any} object structure to use, leave empty to default to standard empty object literal
     * @returns {number} the new context id to use as reference
     */
    addObject(name, type = {}) {
        const id = this._getNextId();
        type.contextId = id;

        this._data[id] = {
            name: name,
            type: "data",
            data: type
        };

        this._callbacks[id] = {};

        return id;
    }

    /**
     * Remove the context from the data store and all it's dependencies
     * @param id {number} context id
     * @returns {*}
     */
    removeObject(id) {
        this._context.delete(id);

        const result = this._removeData(id);
        this._removeCallbacks(id);
        this._removeUpdates(id);
        this._removeTriggers(id);
        this._removeSync(id);
        this._removeConverters(id);

        return result;
    }

    /**
     * Get either the value as defined by the property and id pair
     * or get the object by just defining the id.
     * @param id {number} id of the data object to use, see _dataId on component
     * @param property {string} optional - path to the property
     * @param convert {boolean} if a converter is available do you want to use it, default: true
     * @returns {value}
     */
    getValue(id, property, convert = true) {
        if (id == "undefined" || id == null) return undefined;

        id = this._getContextId(id);

        if (property != null && property.indexOf("$globals.") !== -1) {
            id = crsbinding.$globals;
            property = property.replace("$globals.", "");
        }

        const obj = this._data[Number(id)];

        let value;

        if (obj.type == "data") {
            const data = obj.data;
            if (property == null) return data;
            value = property.indexOf(".") === -1 ? data[property] : getValueOnPath(data, property);
        }
        else {
            const refId = obj.refId;
            value = this._getReferenceValue(refId, property, obj.path, obj.aId);
        }

        if (convert == true) {
            const converter = this.getConverter(id, property);
            if (converter != null) {
                value = converter.get(value);
            }
        }

        return value;
    }

    /**
     * Mark an object as shared so that it will sync properties with objects who assign them selves to this path
     * @param id {number} context id
     * @param property {string} property path of object marked as shared
     * @param sharedItems {array} string array of property names to sync
     */
    makeShared(id, property, sharedItems) {
        id = this._getContextId(id);

        const obj = this._callbacks[id];
        for (let prop of sharedItems) {
            const path = `${property}.${prop}`;
            this._ensurePath(obj, path, (triggerObject, triggerProperty) => {
                if (triggerObject[triggerProperty] == null) {
                    triggerObject[triggerProperty] = {};
                }

                const nextId = this._getNextTriggerId();
                this._triggers.set(nextId, { values: [{id: id, path: path}]});
                triggerObject[triggerProperty].__trigger = nextId;
            });
        }
    }

    /**
     * Get the property value for given context and property path
     * If the result is an array it will also wrap it in a proxy
     * @param id {number / object} context id or object with fields _dataId or __uid
     * @param property {string}
     * @param convert {boolean} if a converter is available do you want to use it, default: true
     * @returns {value}
     */
    getProperty(id, property, convert = true) {
        id = this._getContextId(id);

        let value =  this.getValue(id, property, convert);

        if (Array.isArray(value)) {
            value = createArrayProxy(value, id, property);
        }

        return value;
    }

    /**
     * Set the value of a property for a given context and property path.
     * This function handles special treatment of arrays in addition to the normal set value
     * @param id {number / object} context id value or object with fields _dataId or __uid
     * @param property {string} property path to set the value on
     * @param value {any} the value to set
     */
    setProperty(id, property, value, convert = true) {
        id = this._getContextId(id);

        let oldValue = this.getProperty(id, property, false);

        if (Array.isArray(oldValue)) {
            this.array(id, property).splice(0, oldValue.length);

            if (value != null) {
                if (oldValue.__syncId != null) {
                    value.__syncId = oldValue.__syncId;
                }
                else {
                    delete value.__syncId;
                }
            }
        }

        if (value && value.__uid != null) {
            oldValue && this._unlinkArrayItem(oldValue);
        }

        this._setContextProperty(id, property, value, {oldValue: oldValue, convert: convert});

        if (value && value.__uid) {
            this.linkToArrayItem(id, property, value.__uid);
        }
    }

    /**
     * Set the value on a context for the property value.
     * When in doubt use setProperty instead as this is a legacy function required by older versions of providers.
     * This function does however deal with special types such as formatting numbers and dates.
     * If the value you are sending on is not the right type and you want to make sure it is formatted correctly call this instead of above setProperty function
     * @param id {number} context id
     * @param property {string} property path to set value on
     * @param value {any} value to be set
     * @param oldValue {any} old value before set
     * @param ctxName {string}
     * @param dataType {string} "number", "boolean" or null
     */
    _setContextProperty(id, property, value, options) {
        const oldValue = options.oldValue;
        const ctxName = options.ctxName;
        const dataType = options.dataType;
        const convert = options.convert || true;

        id = this._getContextId(id);

        let obj = this._data[id];
        if (obj == null || obj.__frozen == true) return;

        if (convert == true) {
            const converter = this.getConverter(id, property);
            if (converter != null) {
                value = converter.set(value);
            }
        }

        if (dataType === "boolean" || typeof value === "boolean") {
            value = Boolean(value);
        }
        else if (dataType === "number" || (dataType == null && typeof value !== "object" && (isNaN(value) == false && value != ""))) {
            value = Number(value);
        }

        if (obj.type == "data") {
            obj = this._data[id].data;
            const changed = property.indexOf(".") === -1 ? this._setObjectProperty(obj, property, value) : this._setObjectPropertyPath(obj, property, value);

            if (changed == true) {
                this._performUpdates(id, property, value, oldValue);
                this.updateUI(id, property);
            }
        }
        else {
            this._setReferenceValue(id, property, value, obj.refId, obj.path, obj.aId, ctxName);
        }
    }

    /**
     * Set the property value on a reference object.
     * used internally only
     */
    _setReferenceValue(id, property, value, refId, refPath, refaId, ctxName) {
        const obj = this._data[refId];

        if (obj.type == "data") {
            let v = getValueOnPath(obj.data, refPath);
            const syncId = v.__syncId;

            if (refaId != null) {
                v = v.find(i => i.__aId == refaId);
            }

            if (ctxName != "context") {
                property = property.split(`${ctxName}.`).join("");
            }

            this._setObjectPropertyPath(v, property, value);

            if (syncId != null) {
                if (this._frozenObjects.indexOf(v) === -1) {
                    this._setSyncValues(syncId, property, value, v);
                }
            }

            this._callFunctionsOnPath(id, property);
        }
        else {
            let pString = `${obj.path}.${path}`; // subObj.field1
            return this._getReferenceValue(obj.refId, property, pString)
        }
    }

    /**
     * Crate a new data item but as a reference to a parent
     * @param refId {number} parent context id
     * @param name {name} debug name for the refrence object
     * @param path {string} property path
     * @param index {number} index in the collection
     * @returns {number}
     */
    createReferenceTo(refId, name, path, index) {
        const id = this._getNextId();

        const ref = {
            id: id,
            name: name,
            type: "ref",
            refId: refId,
            path: path
        };

        if (index !== undefined) {
            ref.aId = index;
        }

        this._data[id] = ref;
        this._callbacks[id] = {};
        return id;
    }

    /**
     * Get a value based on a reference id
     * @param id {number} context id
     * @param property {string / null} value property
     * @param path {string / null} value property path
     * @param aId {number} array id
     * @returns {value|null|{value: *, key: *}}
     * @private
     */
    _getReferenceValue(id, property, path, aId) {
        const obj = this._data[id];

        if (obj.type == "data") {
            if (aId === undefined) {
                const p = property == null ? path : `${path}.${property}`;
                return this.getValue(id, p);
            }
            else {
                const ar = this.getValue(id, path);

                let result;

                if (Array.isArray(ar)) {
                    result = ar.find(i => i.__aId == aId);
                }
                else {
                    const item = ar.get(aId);
                    result = {key: aId, value: item};
                }
                // TODO GM: Investigate why result empty. Fix in phase 7.
                return property == null || result == null ? result : getValueOnPath(result, property);
            }
        }
        else {
            let pString = `${obj.path}.${path}`;
            return this._getReferenceValue(obj.refId, property, pString)
        }
    }

    /**
     * Get the next context id
     * @returns {number} the next context id
     */
    _getNextId() {
        return this._nextId("nextId");
    }

    /**
     * Get the next trigger id
     * @returns {number} the next trigger id
     */
    _getNextTriggerId() {
        return this._nextId("nextTriggerId");
    }

    /**
     * Get the next array id
     * @returns {number} next array id
     */
    nextArrayId() {
        return this._nextId("nextArrayId");
    }

    /**
     * Get the next id from the id store based on the idVariable
     * @param idVariable {string} key to use when looking for the next id
     * @returns {number} the next id for that key
     */
    _nextId(idVariable) {
        const id = this._idStore[idVariable];
        this._idStore[idVariable] += 1;
        return id;
    }

    /**
     * Create an array sync where properties between arrays are kept in sync with each other when they change
     * @param id {number} context id
     * @param property {property path to the array}
     * @param primaryKey {the field on an array item that identifies it uniquely}
     * @param fields {array} the field names that needs to be kept in sync
     * @returns {Promise<number>} the sync id used when adding a new array to be synced
     */
    createArraySync(id, property, primaryKey, fields) {
        const array = this.getValue(id, property);

        const syncId = this._idStore.nextSyncId;
        this._idStore.nextSyncId += 1;
        const sync = {
            primaryKey: primaryKey,
            fields: fields,
            collection: []
        };

        this._sync.set(syncId, sync);

        return this.addArraySync(syncId, id, property, array);
    }

    /**
     * Remove a sync property
     * @param syncId {number} sync id passed back from createArraySync
     * @param id {}
     * @param property {string} property
     */
    removeArraySync(syncId, id, property) {
        const syncObj = this._sync.get(syncId);
        id = this._getContextId(id);

        if (syncObj != null) {
            const items = syncObj.collection.filter(item => item.id == id && item.path == property);
            items.forEach(item => syncObj.collection.splice(syncObj.collection.indexOf(item), 1));
            if (syncObj.collection.length == 0) {
                this._sync.delete(syncId);
            }

            const array = this.getValue(id, property);
            if (array != null) {
                delete array.__syncId;
                array.filter(item => item.__syncId == syncId).forEach(item => delete item.__syncId);
            }
        }
    }

    /***
     * Add an array to a existing sync
     * @param syncId {number} the sync id you got back from createArraySync
     * @param id {number / object} either the context id or an object containing field __dataId or __uid
     * @param property
     * @param array
     * @returns {Promise<unknown>}
     */
    addArraySync(syncId, id, property, array) {
        return new Promise(resolve => {
            id = this._getContextId(id);

            this._ensurePath(id, property, () => {
                const sync = this._sync.get(syncId);

                if (sync.collection.filter(item => item.id == id && item.path == property).length > 0) {
                    return resolve(syncId);
                }

                sync.collection.push({
                    id: id,
                    path: property
                })

                if (array == null) {
                    array = this.getValue(id, property);
                }

                array.__syncId = syncId;
                resolve(syncId);
            });
        });
    }

    /**
     * Perform a array sync operation
     * @param syncId {number} sync id
     * @param property {string} the field name that changed
     * @param value {any} the value to sync
     * @param source {object} the source object that the change happened on
     */
    _setSyncValues(syncId, property, value, source) {
        this._frozenObjects.push(source);

        const sync = this._sync.get(syncId);
        if (sync.fields.indexOf(property) !== -1) {
            const idValue = source[sync.primaryKey];

            for (let item of sync.collection) {
                const array = this.getValue(item.id, item.path);
                const data = array.find(item => item[sync.primaryKey] == idValue);
                this._frozenObjects.push(data);

                if (data != source) {
                    this.setProperty(data, property, value);
                }
            }
        }

        this._frozenObjects.length = 0;
    }

    /**
     * Add a object to the context map
     * @param id {number} context id for the context object
     * @param obj {object} the context instance
     */
    addContext(id, obj) {
        this._context.set(id, obj);
    }

    /**
     * Add a callback for a given context and property
     * @param id {number} context id
     * @param property {string} property / path
     * @param callback {function} function to call as the callback
     * @returns {*}
     */
    addCallback(id, property, callback) {
        const obj = this._callbacks[id];
        return property.indexOf(".") === -1 ? this._addCallbackToObject(obj, property, callback) : this._addCallbackToObjectOnPath(obj, property, callback);
    }

    /**
     * Add a callback function to a callback object
     * @param obj {object} callback object from this.callbacks
     * @param property {string} property name that the function needs to be added on
     * @param callback {function} the function to call
     * @private
     */
    _addCallbackToObject(obj, property, callback) {
        obj[property] = obj[property] || {};
        obj[property].__functions = obj[property].__functions || [];
        obj[property].__functions.push(callback);
    }

    /**
     * Add the callback object to each object on the property path
     * @param obj {object} callback object from this.callbacks
     * @param path {string} property path
     * @param callback {function} callback to add
     * @private
     */
    _addCallbackToObjectOnPath(obj, path, callback) {
        this._ensurePath(obj, path, (obj, prop) => {
            this._addCallbackToObject(obj, prop, callback);
        });
    }

    /**
     * Ensure that the path for a given object exists and add placeholders if it does not
     * @param obj {object} the object to create the placeholders on
     * @param path {string} property path to create
     * @param callback {function} callback to call once the path has been created
     * @private
     */
    _ensurePath(obj, path, callback) {
        let cobj = obj;
        const parts = path.split(".");

        for (let i = 0; i < parts.length -1; i++) {
            const part = parts[i];
            if (cobj[part] == null) {
                cobj[part] = {};
            }
            cobj = cobj[part];
        }

        callback && callback(cobj, parts[parts.length -1]);
    }

    /**
     * Remove a function callback on a given context and property path
     * @param id {number} context Id to use
     * @param path {string} property path to use
     * @param callback {function} the callback to call
     */
    removeCallback(id, path, callback) {
        const obj = this._callbacks[id];
        if (obj == null) return;

        const property = getValueOnPath(obj, path);

        if (property.__functions) {
            const index = property.__functions.indexOf(callback);

            if (index !== -1) {
                property.__functions.splice(index, 1);

                if (property.__functions.length == 0) {
                    delete property.__functions;
                }
            }
        }
    }

    /**
     * Perform callbacks for the given context id and property / path
     * @param id {number} context id or object with _dataId or __uid fields.
     * @param property {string} property of path who's callbacks must be fired
     * @returns {Promise<*>}
     */
    async updateUI(id, property) {
        id = this._getContextId(id);

        const obj = this._callbacks[id];

        if (property == null) {
            const properties = this._getOwnProperties(obj);
            for (let prop of properties) {
                await this._callFunctionsOnObject(obj[prop], id, prop);
            }
        }
        else {
            if (property.indexOf(".") !== -1) return this._callFunctionsOnPath(id, property);

            if (obj == null) return;
            if (obj[property] == null) return;
            await this._callFunctionsOnObject(obj[property], id, property);
        }
    }

    /**
     * Perform callbacks on a given callback object
     * @param obj {object} object in the callbacks map
     * @param id {number} contextId required to get the value for the property defined
     * @param property {string} property to get value from for callback
     * @returns {Promise<void>}
     */
    async _callFunctionsOnObject(obj, id, property) {
        const functions = obj.__functions;
        if (functions != null) {
            for(let fn of obj.__functions) {
                const value = this.getValue(id, property);
                await fn(property, value);
            }
        }

        if (obj.__trigger != null) {
            const triggerObj = this._triggers.get(obj.__trigger);
            if (triggerObj.frozen != true) {
                triggerObj.frozen = true;
                for (let trigger of triggerObj.values) {
                    if (trigger.id == id && trigger.path == property) continue;
                    await this.updateUI(trigger.id, trigger.path);
                }
                delete triggerObj.frozen;
            }
        }

        const properties = this._getOwnProperties(obj);
        for (let prop of properties) {
            await this._callFunctionsOnObject(obj[prop], id, `${property}.${prop}`);
        }
    }


    /**
     * Call the callback functions for objects on a path
     * @param id {number} context id
     * @param path {string} property path to call callbacks on
     */
    async _callFunctionsOnPath(id, path) {
        const obj = this._callbacks[id];
        const result =  getValueOnPath(obj, path);
        if (result != null) {
            await this._callFunctionsOnObject(result, id, path);
        }
    }

    /**
     * Perform callbacks on functions if the context has property changed functions
     * @param id {number} context id
     * @param property {string} property or path
     * @param value {any} value to be passed onto the callbacks in the value parameter
     * @returns {Promise<void>}
     */
    async _performUpdates(id, property, value, oldValue) {
        this._performUpdatesChanges(id, property, value);

        const ctx = this._context.get(id);
        if (ctx == null) return;

        const fnName = `${property}Changed`;
        if (ctx[fnName]) {
            await ctx[fnName](value, oldValue)
        }
        else if (ctx["propertyChanged"]) {
            await ctx["propertyChanged"](property, value, oldValue);
        }
    }

    /**
     * This function checks if there are objects on the _updates stack to keep in sync.
     * if so the changes are copied over.
     * @param id {number} context id
     * @param property {string} property path
     * @param value {any} value
     * @private
     */
    _performUpdatesChanges(id, property, value) {
        const obj = this._updates.get(id);
        if (obj == null || obj[property] == null) return;
        this.setProperty(obj[property].originId, obj[property].originProperty, value);
    }

    /**
     * Create a link between the source property and the target property
     * @param sourceId
     * @param sourceProp
     * @param targetId
     * @param targetProp
     * @param value
     */
    link(sourceId, sourceProp, targetId, targetProp, value) {
        if (typeof value != "object" || value === null) {
            this._addUpdateOrigin(sourceId, sourceProp, targetId, targetProp);
            this._addUpdateOrigin(targetId, targetProp, sourceId, sourceProp);
            this._syncValueTrigger(sourceId, sourceProp, targetId, targetProp);
        }
        else {
            this._syncTriggers(sourceId, sourceProp, targetId, targetProp);
        }
    }

    /**
     * Create a link to an array item
     * @param id {number} context id
     * @param path {string} property path
     * @param itemId {number} the uid of the array item
     */
    linkToArrayItem(id, path, itemId) {
        let sourceObj = getValueOnPath(this._callbacks[id], path);
        if (sourceObj == null) return;

        let targetObj = this._callbacks[itemId];

        const properties = this._getOwnProperties(sourceObj);
        for (let property of properties) {
            this._copyTriggers(sourceObj, property, targetObj, property, itemId, property);
        }
    }

    /**
     * Add object origin for a source and target object.
     * This is used internally during the linking process
     */
    _addUpdateOrigin(sourceId, sourceProp, targetId, targetProp) {
        const update = this._updates.get(targetId) || {};
        const source = update[targetProp] || {};

        if (source.originId == sourceId && source.originProperty == sourceProp) return;

        source.originId = sourceId;
        source.originProperty = sourceProp;
        update[targetProp] = source;
        this._updates.set(targetId, update);
    }

    /**
     * Remove an array item context object and clear it's triggers
     * @param object {object} array context object that has a __uid
     * @private
     */
    _unlinkArrayItem(object) {
        const clbObj = this._callbacks[object.__uid];
        this._removeTriggersOnCallbacks(clbObj, object.__uid);
    }

    /**
     * This function is used by the for provider to set up callbacks notifying items being added and removed.
     * See the for provider for details
     */
    setArrayEvents(id, path, itemsAddedCallback, itemsDeletedCallback) {
        const cbObj = this._callbacks[id];

        this._ensurePath(cbObj, path, (obj, property) => {
            obj[property] = obj[property] || {};

            obj[property].__itemsAdded = obj[property].itemsAdded || [];
            obj[property].__itemsAdded.push(itemsAddedCallback);

            obj[property].__itemsDeleted = obj[property].itemsDeleted || [];
            obj[property].__itemsDeleted.push(itemsDeletedCallback);
        });
    }


    /**
     * When array items are added to the proxy, this function is called to update the UI for the new items
     * @param id
     * @param prop
     * @param items
     * @param collection
     */
    arrayItemsAdded(id, prop, items, collection) {
        const obj = this._callbacks[id];
        const clbObj = getValueOnPath(obj, prop);
        if (clbObj == null) return;

        for (let callback of clbObj.__itemsAdded || []) {
            callback(items, collection);
        }
    }

    /**
     * When array items are removed this function is called to update the UI for the removed items
     * @param id
     * @param prop
     * @param items
     * @param collection
     */
    arrayItemsRemoved(id, prop, items, collection) {
        const obj = this._callbacks[id];
        const clbObj = getValueOnPath(obj, prop);
        if (clbObj == null) return;

        for (let callback of clbObj.__itemsDeleted || []) {
            callback(items, collection);
        }
    }

    /**
     * When items with triggers are being replaced by new objects we need to copy those triggers over to make sure the binding stays in tact.
     * @param sourceObj
     * @param sourceProp
     * @param targetObj
     * @param targetProp
     * @param targetId
     * @param targetPath
     * @private
     */
    _copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetPath) {
        const source = sourceObj[sourceProp];
        const target = targetObj[targetProp] = targetObj[targetProp] || {};

        if (source.__trigger != null) {
            target.__trigger = source.__trigger;

            const tr = this._triggers.get(source.__trigger);
            tr.values.push({id: targetId, path: targetPath});
        }

        const properties = this._getOwnProperties(source);
        for (let property of properties) {
            this._copyTriggers(source, property, target, property, targetId, `${targetPath}.${property}`);
        }
    }

    /**
     * Remove the data object of a binding context and all it's references
     * @param id {number} context id
     * @returns {*}
     * @private
     */
    _removeData(id) {
        const result = this._removeReferences(id);
        delete this._data[id];
        const length = Object.keys(this._data).length;
        if (length == 0) {
            this._idStore.nextId = 1;
            this._idStore.nextArrayId = 0;
        }
        result.push(id);
        return result;
    }

    /**
     * Remove reference objects for a given binding context
     * @param parentId {number} the parent's binding context you are referencing
     * @returns {[]}
     * @private
     */
    _removeReferences(parentId) {
        const result = [];

        const keys = Object.keys(this._data);
        for (let key of keys) {
            const ref = this._data[key];
            if (ref.refId == parentId) {
                result.push(ref.id);
                this.removeObject(ref.id);
            }
        }

        return result;
    }

    /**
     * Remove the callbacks for a given context
     * @param id {number} binding context
     * @private
     */
    _removeCallbacks(id) {
        delete this._callbacks[id];
    }

    /**
     * Remove updates defined for the given context
     * @param id {number} binding context
     * @private
     */
    _removeUpdates(id) {
        const remove = Array.from(this._updates).filter(item => item[0] == id || (item[1].value && item[1].value.originId == id));
        for (let rem of remove) {
            this._updates.delete(rem[0]);
        }
    }

    /**
     * Remove all the triggers defined on a given context
     * @param id {number} binding context
     * @private
     */
    _removeTriggers(id) {
        const tr = Array.from(this._triggers);
        for (let trigger of tr) {
            const index = trigger[1].values.findIndex(item => item.id == id);
            if (index != -1) {
                trigger[1].values.splice(index, 1);

                if (trigger.values.length == 0) {
                    this._triggers.delete(trigger[0]);
                }
            }
        }

        if (this._triggers.size == 0) {
            this._idStore.nextTriggerId = 0;
        }
    }

    /**
     * Remove all sync reference for a given context
     * @param id {number} binding context
     * @private
     */
    _removeSync(id) {
        this._sync.forEach((value, key) => {
            const items = value.collection.filter(item => item.id == id);
            items.forEach(item => value.collection.splice(value.collection.indexOf(item), 1));
            if (value.collection.length == 0) {
                this._sync.delete(key);
            }
        });
    }

    /**
     * Remove all the converters for a given context
     * @param id {number} binding context
     * @private
     */
    _removeConverters(id) {
        delete this._converters[id];
    }

    /**
     * Set the property on a object if the value is different
     * @param obj {object} object to set property on
     * @param property {string} property name
     * @param value {any} value to set
     * @returns {boolean} true if changes were made
     * @private
     */
    _setObjectProperty(obj, property, value) {
        if (obj[property] !== value) {
            obj[property] = value;
            return true;
        }
        return false;
    }

    /**
     * Same as setObjectProperty except in this case you can use a path.
     * This function ensures that the path structure exists
     * @param obj {object} object to set the property on
     * @param path {string} property path
     * @param value {any} value to set
     * @returns {boolean} true if changes were made
     * @private
     */
    _setObjectPropertyPath(obj, path, value) {
        let result = true;
        this._ensurePath(obj, path, (obj,  prop) => result = this._setObjectProperty(obj, prop, value));
        return result;
    }

    /**
     * function to get a objects properties but excluding system properties witha __ prefix
     * @param obj {object} object to get properties from
     * @returns {string[]}
     * @private
     */
    _getOwnProperties(obj) {
        return Object.getOwnPropertyNames(obj).filter(item => item.indexOf("__") === -1)
    }

    /**
     * Cleanup function to remove triggers on callback objects
     */
    _removeTriggersOnCallbacks(obj, id) {
        const properties = this._getOwnProperties(obj);
        for (let property of properties) {
            const trigger = obj[property].__trigger;
            if (trigger != null) {
                delete obj[property].__trigger;
                this._removeTriggersOnTriggers(id, trigger);
            }

            if (typeof obj[property] == "object") {
                this._removeTriggersOnCallbacks(obj[property]);
            }
        }
    }

    /**
     * Cleanup function to remove triggers on other triggers
     */
    _removeTriggersOnTriggers(id, triggerId) {
        const obj = this._triggers.get(triggerId);
        const items = obj.values.filter(item => item.id == id)
        for (let item of items) {
            const index = obj.values.indexOf(item);
            obj.values.splice(index, 1);
        }
    }

    _syncValueTrigger(sourceId, sourceProp, targetId, targetProp) {
        let sourceObj = this._callbacks[sourceId];
        let targetObj = this._callbacks[targetId];

        const trigger = getValueOnPath(sourceObj, `${sourceProp}.__trigger`);
        if (trigger != null) {
            targetObj[targetProp] = targetObj[targetProp] || {};
            targetObj[targetProp].__trigger = trigger;

            const tr = this._triggers.get(trigger);
            tr.values.push({id: targetId, path: targetProp});
        }
    }

    _syncTriggers(sourceId, sourceProp, targetId, targetProp) {
        let sourceObj = this._callbacks[sourceId];
        let targetObj = this._callbacks[targetId];

        if (sourceProp.indexOf(".") === -1) {
            this._copyTriggers(sourceObj, sourceProp, targetObj, targetProp, targetId, targetProp);
        }
        else {
            this._ensurePath(targetObj, targetProp, (obj, prop) => {
                obj[prop] = obj[prop] || {};
                const parts = sourceProp.split(".");
                const sp = parts[parts.length -1];  // source property
                const np = parts.splice(0, parts.length -1).join(); // new Path
                const so = getValueOnPath(sourceObj, np); // source object
                this._copyTriggers(so, sp, obj, prop, targetId, targetProp);
            });
        }
    }

    /**
     * Register a property conversion to happen on a given context and path
     * @param id {number} context id or object containing it
     * @param path {string} property path
     * @param converterKey {string} conversion key to use
     */
    setPropertyConverter(id, path, converterKey, triggers) {
        if (converterKey != null) {
            id = this._getContextId(id);
            let obj = this._converters[id];

            if (obj == null) {
                obj = {};
                this._converters[id] = obj;
            }

            this._ensurePath(obj, path, (triggerObject, triggerProperty) => {
                triggerObject[triggerProperty] = converterKey;
            });
        }

        if (triggers != null) {
            this.setPropertyConverterTriggers(id, path, triggers);
        }
    }

    /**
     * When a property changes, also copy the values over to other properties that are used for conversion.
     * This allows you to have multiple fields representing different converters of the same initial value.
     * @param id
     * @param path
     * @param conversions
     */
    setPropertyConverterTriggers(id, path, conversions) {
        id = this._getContextId(id);

        const code = [];
        for (let conversion of conversions) {
            const parts = conversion.split(":");
            const path = parts[0];
            const converter = parts[1];

            this.setPropertyConverter(id, path, converter);
            code.push(`crsbinding.data.setProperty(${id}, "${path}", value);`);
        }

        const fn = new Function("property", "value", code.join("\n"));
        this.addCallback(id, path, fn);
    }
}