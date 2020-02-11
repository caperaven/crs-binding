import {IfStylesProvider} from "./../../../src/binding/providers/if-styles-provider.js";
import {ElementMock} from "../../element.mock.js";

let instance;
let element;
let property;
let value;
let context;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    global.requestAnimationFrame = (callback) => callback();

    property = "style.background";
    value = "isActive == true ? 'blue' : 'red'";
    context = {isActive: true};
    element = new ElementMock();
    instance = new IfStylesProvider(element, context, property, value, "context");
});

test("if-styles-provider - constructor", () => {
    expect(instance._element).toBe(element);
    expect(instance._context).not.toBeNull();
    expect(instance._property).toBe(property);
    expect(instance._value).toBe(value);
    expect(instance._ctxName).toBe("context");
    expect(instance._eventHandler).not.toBeNull();
    expect(instance._expObj).not.toBeNull();
});

test("if-styles-provider - dispose", () => {
    instance.dispose();
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
    expect(instance._ctxName).toBeNull();
});

test("if-styles-provider - propertyChanged - isActive = true", () => {
    instance.propertyChanged();
    expect(element.style.background).toBe("blue");
});

test("if-styles-provider - propertyChanged - isActive = false", () => {
    context.isActive = false;
    instance.propertyChanged();
    expect(element.style.background).toBe("red");
});