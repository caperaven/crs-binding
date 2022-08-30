export default class Form extends crsbinding.classes.ViewBase {
    async connectedCallback() {
        await super.connectedCallback();
    }

    preLoad() {
        crsbinding.translations.add({
            "firstName": "First Name",
            "lastName": "Last Name"
        }, "form")
    }
}