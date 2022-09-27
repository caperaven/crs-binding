export default class Dataset extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        this.setProperty("firstName", "John");
        this.setProperty("lastName", "Doe");
        this.setProperty("age", 20);
    }

    async update() {
        this.setProperty("firstName", "Andre");
        this.setProperty("lastName", "Smith");
        this.setProperty("age", 35);
    }
}