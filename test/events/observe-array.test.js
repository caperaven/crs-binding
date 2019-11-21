let instance;

beforeAll(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    instance = crsbinding.observation.observe([{name: "John"}]);
});

test("observe array - proxy", () => {
    expect(instance).not.toBeNull();
    expect(instance._isArray).toBeTruthy();
    expect(instance[0]._isProxy).toBeTruthy();
    expect(instance._events).not.toBeNull();
});

test ("observe array - release", () => {
    crsbinding.observation.releaseObserved(instance);
    expect(instance.__events).toBeUndefined();
});

test("observe array - events", async () => {
    const notifyPropertyChangedSpy = jest.spyOn(crsbinding.events, "notifyPropertyChanged");

    let itemsAdded = false;
    let itemsRemoved = false;

    instance = crsbinding.observation.observe([{name: "John"}]);
    crsbinding.events.on(instance, "items-added", () => {itemsAdded = true});
    crsbinding.events.on(instance, "items-deleted", () => {itemsRemoved = true});

    instance.push({name: "Jane"});
    instance.pop();

    expect(notifyPropertyChangedSpy).toHaveBeenCalled();

    expect(itemsAdded).toBeTruthy();
    expect(itemsRemoved).toBeTruthy();
});

