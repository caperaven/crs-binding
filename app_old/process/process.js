import {ViewBase} from "../../src/view/view-base.js";
import {schema} from "./schema.js";

export default class Parent2 extends ViewBase {
    async connectedCallback() {
        super.connectedCallback();
        crs.processSchemaRegistry.add(schema);
    }

    preLoad() {
        this.setProperty("value", "Hello Value");
    }
}