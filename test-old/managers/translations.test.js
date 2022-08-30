import {TranslationsManager} from "../../src/managers/translations-manager.js";

let instance;

const translations = {
    buttons: {
        save: "Save",
        cancel: "Cancel"
    },
    labels: {
        code: "Code",
        description: "Description"
    }
}

beforeEach(async () => {
    instance = new TranslationsManager();
});

test("translations - add global", async () => {
    await instance.add(translations);

    expect(instance.dictionary["buttons.save"]).toEqual("Save");
    expect(instance.dictionary["buttons.cancel"]).toEqual("Cancel");
    expect(instance.dictionary["labels.code"]).toEqual("Code");
    expect(instance.dictionary["labels.description"]).toEqual("Description");
})

test("translations - add context", async () => {
    await instance.add(translations, "context");
    expect(instance.dictionary["context.buttons.save"]).toEqual("Save");
    expect(instance.dictionary["context.buttons.cancel"]).toEqual("Cancel");
    expect(instance.dictionary["context.labels.code"]).toEqual("Code");
    expect(instance.dictionary["context.labels.description"]).toEqual("Description");
})

test("translations - get", async () => {
    await instance.add(translations);

    expect(await instance.get("buttons.save")).toEqual("Save");
    expect(await instance.get("buttons.cancel")).toEqual("Cancel");
    expect(await instance.get("labels.code")).toEqual("Code");
    expect(await instance.get("labels.description")).toEqual("Description");
})

test("translations - get from fetch", async () => {
    instance.fetch = async (key) => key;
    let result = await instance.get("no.such.key");
    expect(result).toEqual("no.such.key");
})

test("translations - get from fetch - not set", async () => {
    let result = await instance.get("no.such.key");
    expect(result).toBeNull();
})

test ("translations - delete context", async () => {
    await instance.add(translations);
    await instance.add(translations, "context");

    expect(await instance.get("buttons.save")).toEqual("Save");
    expect(await instance.get("buttons.cancel")).toEqual("Cancel");
    expect(await instance.get("labels.code")).toEqual("Code");
    expect(await instance.get("labels.description")).toEqual("Description");
    expect(await instance.get("context.buttons.save")).toEqual("Save");
    expect(await instance.get("context.buttons.cancel")).toEqual("Cancel");
    expect(await instance.get("context.labels.code")).toEqual("Code");
    expect(await instance.get("context.labels.description")).toEqual("Description");

    await instance.delete("context");

    expect(await instance.get("buttons.save")).toEqual("Save");
    expect(await instance.get("buttons.cancel")).toEqual("Cancel");
    expect(await instance.get("labels.code")).toEqual("Code");
    expect(await instance.get("labels.description")).toEqual("Description");
    expect(await instance.get("context.buttons.save")).toBeNull();
    expect(await instance.get("context.buttons.cancel")).toBeNull();
    expect(await instance.get("context.labels. code")).toBeNull();
    expect(await instance.get("context.labels.description")).toBeNull();
})

test ("translations - get with markup", async () => {
    await instance.add(translations);
    const value = await instance.get_with_markup("&{buttons.save}");
    expect(value).toEqual("Save");
})