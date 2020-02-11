import {OnceProvider} from "./../../../src/binding/providers/once-provider.js"
import {ElementMock} from "../../element.mock.js";

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
});

test("Once provider - execute", () => {
    const element = new ElementMock();

    const context = {
       firstName: "John"
    };

    OnceProvider(element, context, "value", "firstName", "context");
    expect(element.value).toBe("John");
});

test("Once provider - different context", () => {
    const element = new ElementMock();

    const context = {
        firstName: "John"
    };

    OnceProvider(element, context, "value", "firstName", "person");
    expect(element.value).toBe("John");
});

test("Once provider - set data-attribute", () => {
    const element = new ElementMock();

    const context = {
        firstName: "John"
    };

    OnceProvider(element, context, "data-name", "firstName", "person");
    expect(element.dataset.name).toBe("John");
});