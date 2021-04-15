import {ViewBase} from "../../src/view/view-base.js";
import "./form.js";
import "./component1.js";

export default class PropertyBinding extends ViewBase {
    get model() {
        return this.getProperty("model");
    }

    set model(newValue) {
        this.setProperty("model", newValue);
    }

    async connectedCallback() {
        await super.connectedCallback();
        this.count = 0;
    }

    loadData() {
        this.model = {
            datasource: {
                name: `datasource - ${this.count}`
            },
            items: [
                {
                    id: 0,
                    title: `Item 1 - ${this.count}`
                },
                {
                    id: 1,
                    title: `Item 2 - ${this.count}`
                }
            ]
        }

        this.count += 1;
    }
}