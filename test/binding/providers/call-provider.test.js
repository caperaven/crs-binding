import {CallProvider} from "./../../../src/binding/providers/call-provider.js"
import {ElementMock} from "../../element.mock.js";

let instance;
let element;
let context;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.window = {};
    global.crsbinding = bindingModule.crsbinding;

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
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
});

//JHR: todo: fix this test
test.skip("call provider - event", () => {
    instance.event();
    expect(crsbinding.idleTaskManager.add).toBeCalled();
});