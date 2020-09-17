import {ViewBase} from "../../src/view/view-base.js";

export default class Welcome extends ViewBase {
    preLoad() {
        this.setProperty("item", {
            name: "Johan"
        })
    }

    showWidget() {
        crsbinding.events.emitter.postMessage("#my-widget", {
            context: this,
            html: "<h2>${title}</h2><p>Some paragraph stuff that is not bound</p>"
        })
    }
}