import {InnerProvider} from "../../../src/binding/providers/inner-provider.js";
import {ElementMock} from "../../element.mock.js";
import {observe} from "../../../src/events/observer";

let instance;
let element;
let context;
let onspy;

beforeEach(async () => {
    global.window = {};
    global.crsbinding = (await import("../../crsbinding.mock.js")).crsbindingMock;

    element = new ElementMock();
    element.innerText = "${firstName}";

    context = observe({
        firstName: "John"
    });

    onspy = jest.spyOn(context, "on");

    instance = new InnerProvider(element, context);

});

test("inner provider - constructor", () => {
    expect(instance._element).not.toBeNull();
    expect(instance._context).not.toBeNull();
    expect(instance._eventHandler).not.toBeNull();
    expect(instance._expObj).not.toBeNull();
    expect(onspy).toHaveBeenCalled();
});

test("inner provider - _change", () => {
    instance._change();
    expect(element.innerText).toBe(context.firstName);
});

