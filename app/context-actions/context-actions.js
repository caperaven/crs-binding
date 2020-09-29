import {ViewBase} from "../../src/view/view-base.js";

export default class ContextActions extends ViewBase {
    load() {
        this.setProperty("items", [
            {
                id: 0,
                code: "Item 1"
            },
            {
                id: 1,
                code: "Item 2"
            },
            {
                id: 2,
                code: "Item 3"
            },
            {
                id: 3,
                code: "Item 4"
            }
        ]);

        super.load();
    }

    performAction(event) {
        if (event.target.dataset.action != null) {
            const action = event.target.dataset.action;
            const path = event.target.dataset.path;
            const id = Number(event.target.dataset.id);

            this[action](path, id);
        }
    }

    remove(path, id) {
    }

    edit(path, id) {

    }
}