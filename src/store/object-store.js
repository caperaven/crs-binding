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
    }

    get(proxy, autoAdd = true) {
        if (proxy[BID] == null && autoAdd == true) {
            this.add(proxy);
        }

        if (proxy[BID] == null) return null;

        return this._store.get(proxy[BID]);
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