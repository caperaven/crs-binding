import {ProviderFactory} from "./../binding/provider-factory.js";
import {ForOnceProvider} from "./../binding/providers/for-once-provider.js";


export class ProviderManager {
    constructor() {
        this._nextId = 0;
        this.items = new Map();
        this.factory = new ProviderFactory();
        this.providers = {
            for: {
                once: ForOnceProvider
            }
        }
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
        for (let property of element.__cleanup || []) {
            element[property] = null;
        }

        for (let child of element.children || []) {
            await this.releaseElement(child);
        }

        if (element.__providers == null) return;

        for (let id of element.__providers) {
            let provider = this.items.get(id);
            this.items.delete(id);
            provider && provider.dispose();
            provider = null;
        }
        delete element.__providers;

        if (this.items.size == 0) {
            this._nextId = 0;
        }
    }
}