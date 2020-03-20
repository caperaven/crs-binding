const BID = "__bid";

export class ObjectStore {
    get nextId() {
        const result = (this._lastId || 0) + 1;
        this._lastId = result;
        return result;
    }

    constructor() {
        this._lastId = 0;
        this._store = new Map();
    }

    add(proxy, prior) {
        const id = prior && prior[BID] || this.nextId;
        proxy[BID] = id;

        if (prior == null) {
            this._store.set(id, new StoreItem())
        }
    }

    remove(proxy) {
        const id = proxy[BID];
        const obj = this._store.get(id);

        if (obj == null)  return;

        this._store.delete(id);
        obj && obj.dispose();

        if (this._store.size == 0) {
            this._nextId = 0;
            this._lastId = 0;
        }
    }

    get(proxy, autoAdd = true) {
        if (proxy[BID] == null && autoAdd == true) {
            this.add(proxy);
        }

        if (proxy[BID] == null) return null;

        return this._store.get(proxy[BID]);
    }

    setReference(value, oldValue) {
        // 1 If old value does not exist there are no references to carry over
        // If the parent references are the same then also exist as the references are on the parent
        if (oldValue == null || (value.__pbid != null && value.__pbid == oldValue.__pbid)) return;

        // 2. If the value has a parent binding reference add the reference there as it is a collection
        const valueStoreItem = this._store.get(value.__pbid || value.__bid);
        const oldValueStoreItem = this._store.get(oldValue.__bid);

        // 3. If the old value has references use that else create a reference to the old value
        const references = oldValueStoreItem.__references || [oldValue.__bid];

        // 4. Create a reference array for the new value if it does not already exist.
        valueStoreItem.__references = valueStoreItem.__references || [];

        // 5. Add  the references to the new value references if they are not already in the collection
        for (let ref of references) {
            if (valueStoreItem.__references.indexOf(ref) == -1) {
                valueStoreItem.__references.push(ref);
            }
        }
    }
}

class StoreItem {
    constructor() {
        crsbinding.events.enableEvents(this);
    }

    dispose() {
        crsbinding.events.disableEvents(this);
    }
}