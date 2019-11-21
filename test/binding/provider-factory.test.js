import {ProviderFactory} from "./../../src/binding/provider-factory.js";
import {ElementMock} from "../element.mock.js";

let context;
let property;
let value;
let element;

beforeEach(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    element = new ElementMock();
    context = {
        name: "John"
    };
    property = "name";
    value = "John";
});

test("provider factory - bind", () => {
    const instance = ProviderFactory["bind"](element, context, property, value);
    expect(instance).not.toBeNull();
});

test("provider factory - two-way", () => {
    const instance = ProviderFactory["two-way"](element, context, property, value);
    expect(instance).not.toBeNull();
});

test("provider factory - one-way", () => {
    const instance = ProviderFactory["one-way"](element, context, property, value);
    expect(instance).not.toBeNull();
});

test("provider factory - once", () => {
    const instance = ProviderFactory["once"](element, context, property, value);
    expect(instance).toBeNull();
});

test("provider factory - call", () => {
    const instance = ProviderFactory["call"](element, context, property, value);
    expect(instance).not.toBeNull();
});

test("provider factory - delegate", () => {
    const instance = ProviderFactory["delegate"](element, context, property, value);
    expect(instance).not.toBeNull();
});

test("provider factory - inner", () => {
    const instance = ProviderFactory["inner"](element, context, property, value);
    expect(instance).not.toBeNull();
});

test("provider factory - for", () => {
    const instance = ProviderFactory["for"](element, context, property, value);
    expect(instance).not.toBeNull();
});

test("provider factory - if", () => {
    const instance = ProviderFactory["if"]();
    expect(instance).not.toBeNull();
});
