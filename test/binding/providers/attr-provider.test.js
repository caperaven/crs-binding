import {AttrProvider} from "./../../../src/binding/providers/attr-provider.js";
import {ElementMock} from "../../element.mock";

let instance;
let element;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    element = new ElementMock();
    instance = new AttrProvider(element, {prop1: "hello world"}, "title", "prop1", "context");
});

test("attr-provider - constructor", () => {
    expect(instance._element).toBe(element);
    expect(instance._context).not.toBeNull();
    expect(instance._property).toBe("title");
    expect(instance._value).toBe("prop1");
    expect(instance._ctxName).toBe("context");
    expect(instance._eventHandler).not.toBeNull();
    expect(instance._expObj).not.toBeNull();
});

test("attr-provider - dispose", () => {
    instance.dispose();
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
    expect(instance._ctxName).toBeNull();
});

test("attr-provider - _change", () => {
    instance._change();
    const attr = instance._element.getAttribute(instance._property);
    expect(attr.value).toBe("hello world");
});

test("attr-provider - _change no exp", () => {
    instance._expObj = null;
    instance._change();
    const attr = instance._element.getAttribute(instance._property);
    expect(attr).toBeUndefined();
});