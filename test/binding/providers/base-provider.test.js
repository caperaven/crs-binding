import {ProviderBase} from "../../../src/binding/providers/provider-base.js";
import {ElementMock} from "../../element.mock.js";

class TestProvider extends ProviderBase {
}

let element;

beforeEach(async () => {
    const bindingModule = await import("./../../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    element = new ElementMock();
});

test("provider base - constructor", () => {
    const registerSpy = jest.spyOn(crsbinding.providerManager, "register");
    const provider = new TestProvider();
    expect(registerSpy).toHaveBeenCalled();
});

test("provider base - listenOnPath", () => {
    const context = {
        person: {
            name: "John"
        }
    };

   const provider = new TestProvider(element, context, "value", "person.address.street", "person");
   const listenOnPathSpy = jest.spyOn(crsbinding.events, "listenOnPath");
   provider.listenOnPath(["person.address.street"], null);

   expect(listenOnPathSpy).toHaveBeenCalled();
});

test("provider base - initit with errors", () => {
    class T extends ProviderBase {
        async initialize() {
            super.initialize();
            throw new Error ("oops")
        }
    }

    const ins = new T();

    // JHR: Todo How do I check that the error was thrown?
});