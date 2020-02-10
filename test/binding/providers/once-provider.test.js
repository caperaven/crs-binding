import {OnceProvider} from "./../../../src/binding/providers/once-provider.js"
import {ElementMock} from "../../element.mock.js";

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
})

test("Once provider - execute", () => {
    const element = new ElementMock();

    const context = {
       firstName: "John"
    };

    OnceProvider(element, context, "value", "firstName", "context");
    expect(element.value).toBe("John");
});