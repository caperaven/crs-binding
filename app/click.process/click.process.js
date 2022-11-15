import {schema} from "./schema.js";

export default class ClickProcess extends crsbinding.classes.ViewBase {
    get mobi() {
        return import.meta.url.replace(".js", ".mobi.html");
    }

    async connectedCallback() {
        await super.connectedCallback();
        crs.processSchemaRegistry.add(schema);
    }

    preLoad() {
        this.setProperty("value", "Hello");
    }
}