import {IfClassProvider} from "./../../../src/binding/providers/if-classlist-provider.js";
import {ElementMock} from "../../element.mock.js";

let instance;
let element;
let property;
let value;
let context;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    property = "classlist.if";
    value = "isActive == true ? ['green', 'italic'] : 'red'";
    context = {isActive: true};
    element = new ElementMock();
    instance = new IfClassProvider(element, context, property, value, "context");
});

test("if-classlist-provider - constructor", () => {
    expect(instance._element).toBe(element);
    expect(instance._context).not.toBeNull();
    expect(instance._property).toBe(property);
    expect(instance._value).toBe(value);
    expect(instance._ctxName).toBe("context");
    expect(instance._eventHandler).not.toBeNull();
    expect(instance._expObj).not.toBeNull();
});

test("if-classlist-provider - dispose", () => {
    instance.dispose();
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
    expect(instance._ctxName).toBeNull();
});

test("if-classlist-provider - propertyChanged", () => {
    instance.propertyChanged();
    expect(element.classList.contains("green")).toBeTruthy();
    expect(element.classList.contains("italic")).toBeTruthy();
    expect(element.classList.contains("red")).toBeFalsy();
});

test("if-classlist-provider - propertyChanged false", () => {
    context.isActive = false;
    instance.propertyChanged();
    expect(element.classList.contains("green")).toBeFalsy();
    expect(element.classList.contains("italic")).toBeFalsy();
    expect(element.classList.contains("red")).toBeTruthy();
});