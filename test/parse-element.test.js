import {parseElements, parseElement, parseAttributes, parseAttribute} from "../src/binding/parse-element.js";

let element;

beforeEach(() => {
    element = {
        nodeName: "div",
        attributes: [],
        children: [
            {
                nodeName: "input",
                attributes: [
                    {
                        "name": "value.bind",
                        "value": "firstName"
                    }
                ],
                children: []
            }
        ]
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

test("parseElement", async () => {
    const context = {firstName: "John"};
    await parseElement(element, context);

    // expect this  element to be on the montiroing object
});