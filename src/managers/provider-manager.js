import {ForOnceProvider} from "../binding/providers/for-once-provider.js";
import {ForMapProvider} from "../binding/providers/for-map-provider.js";
import {ForRadioProvider} from "../binding/providers/for-radio-provider.js"
import {ForInflateProvider} from "../binding/providers/for-inflate-provider.js";

export class ProviderManager {
    constructor() {
        this._nextId = 0;
        this.items = new Map();
        this.providers = {
            for: {
                map: ForMapProvider,
                once: ForOnceProvider,
                radio: ForRadioProvider,
                inflate: ForInflateProvider
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
        if (element.nodeName?.toLowerCase() == "svg") {
            crsbinding.svgCustomElements.release(element);
        }

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