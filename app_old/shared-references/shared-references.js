import {ViewBase} from "../../src/view/view-base.js";
import "./component.js";

export default class SharedReferences extends ViewBase {
    load() {
        this.setProperty("variables.items", [
            {
                title: "Item 1"
            },
            {
                title: "Item 2"
            }
        ]);

        crsbinding.data.makeShared(this, "model.sharedObject", ["title"]);

        super.load();
    }
}