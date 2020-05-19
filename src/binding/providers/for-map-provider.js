import {RepeatBaseProvider} from "./repeat-base-provider.js";

export class ForMapProvider extends RepeatBaseProvider {
    dispose() {
        super.dispose();
    }

    async _renderItems(array) {
        super._renderItems();

        const fragment = document.createDocumentFragment();

        array.forEach((value, key) => {
            const element = this.createElement(value, key);
            value.__aId = key;

            fragment.appendChild(element);
        });

        this.positionStruct.addAction(fragment);

        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }
    }
}