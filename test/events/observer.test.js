import {observe, releaseObserved} from "../../src/events/observer.js"
import {crsbindingMock} from "./../crsbinding.mock.js";

beforeAll(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
});

test("observer", () => {
    const px = observe({
        name: "John",
        lastName: "Doe",
        propertyChanged: jest.fn()
    });

    expect(px.on).not.toBeNull();
    expect(px.notifyPropertyChanged).not.toBeNull();
    expect(px.__isProxy).toBe(true);
    expect(px.__backup).not.toBeNull();
});

test("observer - propertyChagned: value", () => {
    const px = observe({
        name: "John",
        lastName: "Doe",
        propertyChanged: jest.fn()
    });
});

test("observer - propertyChanged: complex object", () => {
    const px = observe({
        name: "John",
        lastName: "Doe",
        propertyChanged: jest.fn()
    });

    px.name = "John2";
    expect(px.propertyChanged).toHaveBeenCalled();
    expect(px.name).toBe("John2");
    expect(px.__backup.name).toBe("John");
});

test ("observer - subObjects", () => {
    const address = {
        street: "Street 1",
        dispose: jest.fn()
    };

    const oldStreets = [];

    const px = observe({
        address: observe(address),
        propertyChanged: (newValue, oldValue) => {
            if (newValue.street == "street 2") {
                expect(oldValue.street).toBe("Street 1");
            }
            else if (newValue.street == "street 3") {
                expect(oldValue.street).toBe("Street 2")
            }
            oldStreets.push(oldValue.street);
        }
    });

    px.address = observe({
       street: "Street 2"
    });

    px.address = observe({
        street: "Street 3"
    });

    expect(address.dispose).toHaveBeenCalled();
    expect(oldStreets.length).toBe(2);
    expect(oldStreets[0]).toBe("Street 1");
    expect(oldStreets[1]).toBe("Street 2");
});

test("observer - releaseObserved", () => {
    const obj = {
        name: "John",
        lastName: "Doe",
        dispose: jest.fn()
    };

    const px = observe(obj);
    expect(px.on).not.toBeNull();
    expect(px.notifyPropertyChanged).not.toBeNull();
    expect(px.__isProxy).toBe(true);
    expect(px.__backup).not.toBeNull();

    releaseObserved(px);
    expect(px.on).toBeUndefined();
    expect(px.notifyPropertyChanged).toBeUndefined();
    expect(px.__isProxy).toBeUndefined();
    expect(px.__backup).toBeUndefined();

    expect(obj.dispose).toHaveBeenCalled()
});