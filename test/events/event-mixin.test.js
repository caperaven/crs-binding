import {crsbindingMock} from "./../crsbinding.mock.js";

beforeAll(() => {
    global.crsbinding = crsbindingMock;
});

test ("enableEvents - on -> notifyPropertyChanged", () => {
    const obj = {
        property: "value"
    };

    crsbinding.events.enableEvents(obj);
    expect(obj.__events).not.toBeNull();
    expect(obj.__conditions).not.toBeNull();

    let propertyChanged = false;
    crsbinding.events.on(obj, "property", () => propertyChanged = true);

    crsbinding.events.notifyPropertyChanged(obj, "notThere");
    expect(propertyChanged).toBe(false);

    crsbinding.events.notifyPropertyChanged(obj, "property");
    expect(propertyChanged).toBe(true);

    crsbinding.events.disableEvents(obj);
    expect(obj.__events).toBeUndefined();
    expect(obj.__conditions).toBeUndefined();
});

test("when / removeWhen", () => {
    const obj = {
        property: "value"
    };

    crsbinding.events.enableEvents(obj);

    let whenFired = false;
    const fn = () => whenFired = true;
    const exp = "property == 'test'";

    crsbinding.events.when(obj, exp, fn);
    obj.property = "test";
    crsbinding.events.notifyPropertyChanged(obj, "property");

    expect(obj.__events.size).toBe(2);
    expect(obj.__conditions.size).toBe(1);

    expect(whenFired).toBe(true);

    crsbinding.events.removeWhen(obj, exp, fn);

    expect(obj.__events.size).toBe(0);
    expect(obj.__conditions.size).toBe(0);
});

test("disableEvents remove conditions", () => {
    const obj = {
        property: "value"
    };

    crsbinding.events.enableEvents(obj);

    let whenFired = false;
    const fn = () => whenFired = true;
    const exp = "property == 'test'";

    crsbinding.events.when(obj, exp, fn);
    obj.property = "test";
    crsbinding.events.notifyPropertyChanged(obj, "property");

    expect(obj.__events.size).toBe(2);
    expect(obj.__conditions.size).toBe(1);

    expect(whenFired).toBe(true);

    const events = obj.__events;
    const conditions = obj.__conditions;
    crsbinding.events.disableEvents(obj);

    expect(events.size).toBe(0);
    expect(conditions.size).toBe(0);
    expect(obj.__events).toBeUndefined();
    expect(obj.__conditions).toBeUndefined();
});