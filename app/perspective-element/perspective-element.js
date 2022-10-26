export default class PerspectiveElement extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        this.setProperty("selectedView", "default");
        this.setProperty("context", this._dataId);
        this.setProperty("message", "hello world");
    }
}