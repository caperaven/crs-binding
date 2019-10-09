import {OneWayProvider} from "../../../src/binding/providers/one-way-provider.js";
import {observe, releaseObserved} from "../../../src/events/observer.js";
import {enableEvents, disableEvents} from "../../../src/events/event-mixin.js";
import {compileExp} from "./../../../src/events/compiler.js";

let instance;
let element;
let context;
let expObj;
let onSpy;
let removedSpy;
let idleTaskManagerSpy;

beforeEach(async () => {
    expObj = {
        function: jest.fn()
    };

    global.window = {};

    const idleModule = await import("../../../src/idle/idleTaskManager.js");

    global.crsbinding = {
        _expFn: new Map(),
        enableEvents: enableEvents,
        disableEvents: disableEvents,
        idleTaskManager: new idleModule.IdleTaskManager(),
        providerManager: {
            register: jest.fn()
        },
        compileExp: compileExp,
        releaseExp: jest.fn()
    };

    element = {
        value: null
    };

    context = observe({
        "firstName": null
    });

    onSpy = jest.spyOn(context, "on");
    removedSpy = jest.spyOn(context, "removeOn");
    idleTaskManagerSpy = jest.spyOn(crsbinding.idleTaskManager, "add");
    instance = new OneWayProvider(element, context, "value", "firstName");
});

afterEach(() => {
    releaseObserved(context);
});

test("One Way Provider - construction", () => {
    expect(instance._element).toBe(element);
    expect(instance._context).toBe(context);
    expect(instance._property).toBe("value");
    expect(instance._value).toBe("firstName");
    expect(instance._eventHandler).not.toBeUndefined();
    expect(instance._exp).not.toBeUndefined();
    expect(instance._expObj).not.toBeUndefined();
    expect(onSpy).toHaveBeenCalled();
});

test("One Way Provider - dispose", () => {
    const removed = jest.fn(context.removeOn);
    instance.dispose();
    expect(removedSpy).toHaveBeenCalled();
    expect(crsbinding.releaseExp).toBeCalled();

    expect(instance._element).toBeUndefined();
    expect(instance._context).toBeUndefined();
    expect(instance._property).toBeUndefined();
    expect(instance._value).toBeUndefined();
    expect(instance._eventHandler).toBeNull();
    expect(instance._exp).toBeNull();
    expect(instance._expObj).toBeUndefined();
});

test("One Way Privider - property changed", () => {
    context.firstName = "John";
    expect(context.firstName).toEqual("John");
    expect(element.value).toEqual("John");
    expect(idleTaskManagerSpy).toHaveBeenCalled();
});