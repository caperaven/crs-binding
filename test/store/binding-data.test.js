beforeAll(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    crsbinding.data.clear();
});

test("create object", () => {
    const id = crsbinding.data.addObject("View model");
    expect(id).toEqual(0);

    const result = crsbinding.data.getValue(id);
    expect(result).not.toBeUndefined();
    expect(result).not.toBeNull();
});

test("create simple property", () => {
    const id = crsbinding.data.addObject("View model");
    crsbinding.data.setProperty(id, "field1", "Hello World");

    const result = crsbinding.data.getValue(id);
    expect (result.field1).toEqual("Hello World");
});

test("create path property", () => {
    const id = crsbinding.data.addObject("View model");
    crsbinding.data.setProperty(id, "subObj.field1", "Hello World");

    const result = crsbinding.data.getValue(id);
    expect(result.subObj).not.toBeUndefined();
    expect (result.subObj.field1).toEqual("Hello World");

    const fieldValue = crsbinding.data.getValue(id, "subObj.field1");
    expect(fieldValue).toEqual("Hello World");
});

test("createReference", () => {
    // Source of truth
    const id = crsbinding.data.addObject("View model");
    crsbinding.data.setProperty(id, "subObj.field1", "Hello World");

    // create reference to sub object
    const subObjId = crsbinding.data.createReferenceTo(id, "subObj", "subObj");
    const subObj = crsbinding.data.getValue(subObjId);
    const field1Value = crsbinding.data.getValue(subObjId, "field1");
    expect(subObj.field1).toEqual("Hello World");
    expect(field1Value).toEqual("Hello World");

    const fieldId = crsbinding.data.createReferenceTo(subObjId, "field1", "field1");
    const value = crsbinding.data.getValue(fieldId);
    expect(value).toEqual("Hello World");
});

