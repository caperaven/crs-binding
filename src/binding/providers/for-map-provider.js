import {RepeatBaseProvider} from "./repeat-base-provider.js";

export class ForMapProvider extends RepeatBaseProvider {
    dispose() {
        this._updateHandler = null;
        super.dispose();
    }

    init() {
        this._updateHandler = this._update.bind(this);
    }

    async _renderItems() {
        super._renderItems();

        const fragment = document.createDocumentFragment();
        const parentId = this.ar.__binding.id;
        this.ar.forEach((value, key) => {
            const obj = {key: key, value: value};
            const element = this.createElement(obj);

            const instance = crsbinding._bindingStore.get(obj.__binding.id);
            instance.parent = parentId;

            fragment.appendChild(element);
        });

        this._container.innerHTML = "";
        this._container.appendChild(fragment);

        crsbinding.expression.updateUI(this.ar);

        if (this._container.__providers == null) {
            this._container.__providers = [];
        }

        if (this._container.__providers.indexOf(this.id) == -1) {
            this._container.__providers.push(this.id);
        }
    }

    _update() {
        this._clear();
        this._renderItems();
    }
}