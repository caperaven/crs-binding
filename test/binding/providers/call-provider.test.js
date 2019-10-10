import {CallProvider} from "./../../../src/binding/providers/call-provider.js"
import {ElementMock} from "../../element.mock.js";

let instance;
let element;
let context;

beforeEach(() => {

    global.crsbinding = {
        idleTaskManager: {
            add: jest.fn()
        },
        providerManager: {
            register: jest.fn()
        }
    };

    element = new ElementMock();

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
   expect(element.addEventListener).toBeCalled();
});

test("call provider - dispose", () => {
    instance.dispose();
    expect(element.removeEventListener).toBeCalled();
    expect(instance._eventHandler).toBeNull();
    expect(instance._fn).toBeNull();
    expect(instance._element).toBeUndefined();
    expect(instance._context).toBeUndefined();
    expect(instance._property).toBeUndefined();
    expect(instance._value).toBeUndefined();
});

test("call provider - event", () => {
    instance.event();
    expect(crsbinding.idleTaskManager.add).toBeCalled();
});