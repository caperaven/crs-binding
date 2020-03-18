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

    setReference(id, referenceId) {
        const si1 = this._store.get(id);
        const si2 = this._store.get(referenceId);

        const references = si2.__references || [referenceId];

        si1.__references = si1.__references || [];
        si1.__references = [...si1.__references, ...references];
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