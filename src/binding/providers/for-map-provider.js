import {RepeatBaseProvider} from "./repeat-base-provider.js";

export class ForMapProvider extends RepeatBaseProvider {
    dispose() {
        super.dispose();
    }

    async _renderItems(array) {
        await super._renderItems();

        const fragment = document.createDocumentFragment();
        const keys = array.keys();

        for (let key of keys) {
            const value = array.get(key);
            value.__aId = key;
            fragment.appendChild(await this.createElement(value, key));
        }

        this.positionStruct.addAction(fragment);

        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }
    }
}