import {InnerProvider} from "../../../src/binding/providers/inner-provider.js";
import {ElementMock} from "../../element.mock.js";
import {observe} from "../../../src/events/observer";

let instance;
let element;
let context;
let onspy;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    element = new ElementMock();
    element.innerText = "${firstName}";

    context = observe({
        firstName: "John"
    });

    onspy = jest.spyOn(crsbinding.events, "on");

    instance = new InnerProvider(element, context);

});

test("inner provider - constructor", () => {
    expect(instance._element).not.toBeNull();
    expect(instance._context).not.toBeNull();
    expect(instance._eventHandler).not.toBeNull();
    expect(instance._expObj).not.toBeNull();
    expect(onspy).toHaveBeenCalled();
});

test("inner provider - dispose", () => {
    const releaseSpy = jest.spyOn(crsbinding.expression, "release");
    instance.dispose();

    expect(releaseSpy).toHaveBeenCalled();
    expect(instance._expObj).toBeNull();
    expect(instance._eventHandler).toBeNull();
    expect(instance._eventsToRemove).toBeNull();
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
});

test("inner provider - _change", () => {
    instance._change();
    expect(element.innerText).toBe(context.firstName);
});

