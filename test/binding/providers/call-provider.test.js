import {CallProvider} from "./../../../src/binding/providers/call-provider.js"
import {ElementMock} from "../../element.mock.js";

let instance;
let element;
let context;
let addEventListenerSpy;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    element = new ElementMock();
    addEventListenerSpy = jest.spyOn(element, "addEventListener");

    context = {
        doSomething: jest.fn()
    };

    instance = new CallProvider(element, context, "click", "doSomething");
});

test("call provider - constructor", () => {
    expect(instance._element).toBe(element);
    expect(instance._context).toBe(context);
    expect(instance._property).toBe("click");
    expect(instance._value).toBe("doSomething");
    expect(instance._eventHandler).not.toBeUndefined();
    expect(instance._fn).not.toBeUndefined();
    expect(addEventListenerSpy).toHaveBeenCalled();
});

test("call provider - dispose", () => {
    const removeEventListenerSpy = jest.spyOn(element, "removeEventListener");

    instance.dispose();
    expect(removeEventListenerSpy).toHaveBeenCalled();
    expect(instance._eventHandler).toBeNull();
    expect(instance._fn).toBeNull();
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
});

test("call provider - event", () => {
    const idelTaskSpy = jest.spyOn(crsbinding.idleTaskManager, "add");
    instance.event();
    expect(idelTaskSpy).toHaveBeenCalled();
});