import {IfProvider} from "./../../../src/binding/providers/if-provider.js";

import {ElementMock} from "../../element.mock.js";
import {DocumentMock} from "./../../dom-mock.js";

let instance;
let element;
let context;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    global.document = new DocumentMock();

    element = new ElementMock();

    context = {
        name: "a"
    };

});

test("if provider - constructor", () => {
    instance = new IfProvider(element, context, "hidden", "name == 'a'");

    expect(instance._element).toBe(element);
    expect(instance._context).toBe(context);
    expect(instance._property).toBe("hidden");
    expect(instance._value).toBe("name == 'a'");
}) ;

test("if provider - dispose", () => {
    instance = new IfProvider(element, context, "hidden", "name == 'a'");
    instance.dispose();
    expect(instance._element).toBeNull();
    expect(instance._context).toBeNull();
    expect(instance._property).toBeNull();
    expect(instance._value).toBeNull();
});

test("if provider - initialize normal function", async () => {
    instance = new IfProvider(element, context, "hidden", "name == 'a'");
    const spy = jest.spyOn(instance, "_initCndAttr");
    const listenOnPathSpy = jest.spyOn(instance, "listenOnPath");

    await instance.initialize();
    expect(spy).toHaveBeenCalled();
    expect(listenOnPathSpy).toHaveBeenCalled();
    expect(instance._expObj).not.toBeNull();
});

test("if provider - initialize if function", async () => {
    instance = new IfProvider(element, context, "hidden", "name == 'a' ? true");
    const spy = jest.spyOn(instance, "_initCndAttrValue");
    const listenOnPathSpy = jest.spyOn(instance, "listenOnPath");

    await instance.initialize();
    expect(spy).toHaveBeenCalled();
    expect(listenOnPathSpy).toHaveBeenCalled();
    expect(instance._expObj).not.toBeNull();
});

test("if provider - initialize if/else function", async () => {
    instance = new IfProvider(element, context, "hidden", "name == 'a' ? true : false");
    const spy = jest.spyOn(instance, "_initCndValue");
    const listenOnPathSpy = jest.spyOn(instance, "listenOnPath");

    await instance.initialize();
    expect(spy).toHaveBeenCalled();
    expect(listenOnPathSpy).toHaveBeenCalled();
    expect(instance._expObj).not.toBeNull();
});

test ("if provider - propertyChanged", () => {
    instance = new IfProvider(element, context, "hidden", "name == 'a' ? true : false");
    const spy = jest.spyOn(crsbinding.idleTaskManager, "add");
    instance.propertyChanged();
    expect(spy).toHaveBeenCalled();
});
