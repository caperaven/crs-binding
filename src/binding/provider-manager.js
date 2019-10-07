export class ProviderManager {
    constructor() {
        this._nextId = 0;
        this.items = new Map();
    }

    async register(provider) {
        provider.id = this._nextId;

        if (provider._element.__providers == null) {
            Reflect.set(provider._element, "__providers", []);
        }

        provider._element.__providers.push(this._nextId);
        this.items.set(this._nextId, provider);
        this._nextId += 1;
    }

    async releaseElement(element) {
        for (let child of element.children || []) {
            this.releaseElement(child);
        }

        if (element.__providers == null) return;

        for (let id of element.__providers) {
            const provider = this.items.get(id);
            provider.dispose();
            this.items.delete(id);
        }
    }
}