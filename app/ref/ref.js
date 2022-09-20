export default class Ref extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();

        this.changeElement.textContent = "Hello World";
    }
}