import {enableEvents, disableEvents} from "../src/event-mixin.js";

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