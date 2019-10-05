import {parseElements, parseElement, parseAttributes, parseAttribute} from "../src/binding/parse-element.js";

beforeEach(() => {
});

test("parseAttribute", async () => {
    const attr = {name: "value.bind", value: "firstName"};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("BindProvider");
});

test("parseAttribute", async () => {
    const attr = {name: "value.two-way", value: "firstName"};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("BindProvider");
});

test("parseAttribute", async () => {
    const attr = {name: "value.one-way", value: "firstName"};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("OneWayProvider");
});

test("parseAttribute - once", async () => {
    const attr = {name: "value.once", value: "firstName"};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("OnceProvider");
});

test("parseAttribute - when", async () => {
    const attr = {name: "value.when", value: "firstName"};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("WhenProvider");
});

test("parseAttribute - call", async () => {
    const attr = {name: "value.call", value: "firstName"};
    const provider = await parseAttribute(attr, {firstName: "John"});

    expect(provider).not.toBeNull();
    expect(provider.constructor.name).toBe("CallProvider");
});