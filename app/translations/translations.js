import {ViewBase} from "../../src/view/view-base.js";

const translations = {
    title: "Translation Title",
    buttons: {
        save: "Save",
        cancel: "Cancel"
    }
}

export default class Translations extends crsbinding.classes.ViewBase {
    async preLoad() {
        await crsbinding.translations.add(translations);
        await crsbinding.translations.add(translations, "context");
    }
}