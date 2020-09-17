import {ViewBase} from "../../src/view/view-base.js";

export default class Welcome extends ViewBase {
    fn1(...args) {
        console.log(args);
    }

    preLoad() {
        this.setProperty("item", {
            name: "Johan"
        })
    }

    showWidget() {
        crsbinding.events.emitter.postMessage("#my-widget", {
            contextId: this._dataId,
            html: "<h2>${title}</h2><p>Some paragraph stuff that is not bound</p>"
        })
    }
}