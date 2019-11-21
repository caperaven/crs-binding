import {ElementMock} from "../element.mock.js";
import {ProviderBase} from "./../../src/binding/providers/provider-base.js";

class TestProvider extends ProviderBase {
}

let provider;
let element;

beforeEach(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
    element = new ElementMock();
});

test("provider manger - constructor", () => {
    expect(crsbinding.providerManager._nextId).toBe(0);
    expect(crsbinding.providerManager.items).not.toBeNull();
});

test("provider manager - register", () => {
    const registerSpy = jest.spyOn(crsbinding.providerManager, "register");
    const provider = new TestProvider(element, {}, "p", "v");
    expect(registerSpy).toHaveBeenCalled();
    expect(provider._element.__providers).not.toBeNull();
    expect(crsbinding.providerManager.items.size).toBe(1);
});

test("provider manager - releaseElement", async () => {
    crsbinding.providerManager.items.clear();

    const provider = new TestProvider(element, {}, "p", "v");
    provider._element.children.push(new ElementMock());

    expect(provider._element.__providers).not.toBeNull();
    await crsbinding.providerManager.releaseElement(provider._element);

    expect(element.__providers).toBeNull();
    expect(crsbinding.providerManager.items.size).toBe(0);
});