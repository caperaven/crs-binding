export default class ForOnce extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        let items = [];
        for (let i = 1; i <= 10; i++) {
            items.push({"code": `item - ${i}`})
        }
        this.setProperty("items", items);
    }
}