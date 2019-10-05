import {enableEvents, disableEvents} from "../src/event-mixin.js";

beforeAll(() => {
    global.crsbinding = {
        _expFn: new Map(),
        enableEvents: enableEvents,
        disableEvents: disableEvents
    }
});

test ("enableEvents - on -> notifyPropertyChanged", () => {
    const obj = {
        property: "value"
    };

    enableEvents(obj);
    expect(obj.on).not.toBeNull();
    expect(obj.when).not.toBeNull();
    expect(obj.notifyPropertyChanged).not.toBeNull();
    expect(obj.__events).not.toBeNull();

    let propertyChanged = false;
    obj.on("property", () => propertyChanged = true);

    obj.notifyPropertyChanged("notThere");
    expect(propertyChanged).toBe(false);

    obj.notifyPropertyChanged("property");
    expect(propertyChanged).toBe(true);

    disableEvents(obj);
    expect(obj.on).toBeUndefined();
    expect(obj.when).toBeUndefined();
    expect(obj.notifyPropertyChanged).toBeUndefined();
    expect(obj.__events).toBeUndefined();
});

test("when / removeWhen", () => {
    const obj = {
        property: "value"
    };

    enableEvents(obj);

    let whenFired = false;
    const fn = () => whenFired = true;
    const exp = "property == 'test'";

    obj.when(exp, fn);
    obj.property = "test";
    obj.notifyPropertyChanged("property");

    expect(obj.__events.size).toBe(2);
    expect(obj.__conditions.size).toBe(1);

    expect(whenFired).toBe(true);

    obj.removeWhen(exp, fn);

    expect(obj.__events.size).toBe(0);
    expect(obj.__conditions.size).toBe(0);
});

test("disableEvents remove conditions", () => {
    const obj = {
        property: "value"
    };

    enableEvents(obj);

    let whenFired = false;
    const fn = () => whenFired = true;
    const exp = "property == 'test'";

    obj.when(exp, fn);
    obj.property = "test";
    obj.notifyPropertyChanged("property");

    expect(obj.__events.size).toBe(2);
    expect(obj.__conditions.size).toBe(1);

    expect(whenFired).toBe(true);

    const events = obj.__events;
    const conditions = obj.__conditions;
    disableEvents(obj);

    expect(events.size).toBe(0);
    expect(conditions.size).toBe(0);
    expect(obj.__events).toBeUndefined();
    expect(obj.__conditions).toBeUndefined();
});