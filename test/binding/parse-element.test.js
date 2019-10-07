import {parseElements, parseElement, parseAttributes, parseAttribute, releaseBinding} from "../../src/binding/parse-element.js";
import {ProviderManager} from "../../src/binding/provider-manager.js";

let element;

beforeEach(() => {
    global.crsbinding = {
        providerManager: new ProviderManager()
    };

    element = {
        nodeName: "div",
        attributes: [],
        children: [
            {
                nodeName: "input",
                __providers: [],
                attributes: [
                    {
                        "name": "value.bind",
                        "value": "firstName",
                        "ownerElement": {
                        }
                    }
                ],
                children: []
            }
        ],
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    }
});

test("parseAttribute", async () => {
    const attr = {name: "value.bind", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("BindProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute", async () => {
    const attr = {name: "value.two-way", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("BindProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute", async () => {
    const attr = {name: "value.one-way", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("OneWayProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute - once", async () => {
    const attr = {name: "value.once", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("OnceProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute - when", async () => {
    const attr = {name: "value.when", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("WhenProvider");    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute - call", async () => {
    const attr = {name: "value.call", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("CallProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseElement - check provider manager and also release element", async () => {
    const context = {firstName: "John"};
    await parseElement(element, context).catch(error => throw new Error(error));
    expect(crsbinding.providerManager.items.size).toEqual(1);

    await crsbinding.providerManager.releaseElement(crsbinding.providerManager.items.get(0)._element);
    expect(crsbinding.providerManager.items.size).toEqual(0);

    // just for code completion, there is a bug in the tests where it does not reflect dynamic properties set.
    await crsbinding.providerManager.releaseElement(element);
});

test("releaseBinding", async () => {
    crsbinding.providerManager.releaseElement = jest.fn();
    await releaseBinding(element);
    expect(crsbinding.providerManager.releaseElement).toBeCalled();
});