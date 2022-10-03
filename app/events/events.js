import "./source-component.js";

export default class Events extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    async sourceChanged(event) {
        console.log(event);
    }
}