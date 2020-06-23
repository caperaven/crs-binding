import {parseElements, parseAttribute, releaseBinding, releaseChildBinding} from "../../src/binding/parse-element.js";
import {ElementMock} from "./../element.mock.js";

let element;
let context;

beforeEach(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;

    context = crsbinding.data.addObject("test object");
    crsbinding.data.setProperty(context, "firstName", "John");

    element = new ElementMock();
    element.children.push(new ElementMock());

    element.children[0].setAttribute("name", "value.bind");
    element.children[0].setAttribute("value", "firstName");
    element.children[0].ownerElement = {
        addEventListener: jest.fn(),
        removeEventListener: jest.fn()
    };
});

test("parseElements", async () => {
    const element = new ElementMock("input");
    element.setAttribute("value.bind", "name");
    element.children.push(new ElementMock());

    const context = {
        name: "John"
    };

    const elements = [element];
    await parseElements(elements, context);

    expect(crsbinding.providerManager.items.size).toBeGreaterThan(0);

    await releaseChildBinding(element);
});

test("parseElement - inner provider", async () => {
    const element = new ElementMock("div");
    element.innerText = "${name}";

    const elements = [element];
    await parseElements(elements, context);

    expect(crsbinding.providerManager.items.size).toBeGreaterThan(0);
});

test("parseAttribute", async () => {
    const attr = {name: "value.bind", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, context);

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("BindProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute", async () => {
    const attr = {name: "value.two-way", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, context);

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("BindProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute", async () => {
    const attr = {name: "value.one-way", value: "firstName", ownerElement: element};
    const provider = await parseAttribute(attr, context);

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("OneWayProvider");
    expect(provider._element).not.toBeNull();
    expect(provider._context).not.toBeNull();
    expect(provider._property).not.toBeNull();
    expect(provider._value).not.toBeNull();
});

test("parseAttribute - once", async () => {
    const attr = {name: "value.once", value: "firstName", ownerElement: element};
    const provider = parseAttribute(attr, context);
    expect(provider).toBeNull();
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

test("releaseBinding", async () => {
    crsbinding.providerManager.releaseElement = jest.fn();
    await releaseBinding(element);
    expect(crsbinding.providerManager.releaseElement).toBeCalled();
});
