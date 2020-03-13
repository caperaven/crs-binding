beforeAll(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
});

test("construction", () => {
    expect(crsbinding._objStore).not.toBeNull();
    expect(crsbinding._objStore._lastId).toBe(0);
    expect(crsbinding._objStore._store).not.toBeNull();
});

test("nextId", () => {
   const nextId = crsbinding._objStore.nextId;
   expect(nextId).toBe(1);
   expect(crsbinding._objStore._lastId).toBe(1);
});

test("add - get first id", () => {
    const obj = {};
    crsbinding._objStore.add(obj, null);
    expect(obj.__bid).not.toBeUndefined();
    expect(obj.__bid).toEqual(crsbinding._objStore._lastId);
    expect(crsbinding._objStore._store.get(obj.__bid)).not.toBeUndefined();
});

test("add - pass on id", () => {
    const obj = {};
    const parent = {__bid: 10};
    crsbinding._objStore.add(obj, parent);
    expect(obj.__bid).not.toBeUndefined();
    expect(obj.__bid).toEqual(parent.__bid);
});

test("remove - remove item from store", () => {
    const obj = {};
    crsbinding._objStore.add(obj);
    const target = crsbinding._objStore._store.get(obj.__bid);
    const disposeSpy = jest.spyOn(target, "dispose");

    crsbinding._objStore.remove(obj);
    expect(disposeSpy).toHaveBeenCalled();
});