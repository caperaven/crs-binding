import {clone} from "./../../src/lib/clone.js";

beforeAll(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
});

test("clone - none", () => {
    const result = crsbinding.utils.clone(null);
    expect(result).toBeNull();
});

test("clone", () => {
    const source = {test: "testing"};
    const result = crsbinding.utils.clone(source);
    expect(result.test).toBe(source.test);
    expect(result).not.toBe(source);
});

test("clone - observed", () => {
    const source = crsbinding.observation.observe({test: "testing"});
    const eventSource = {__events: new Map([["key", "value"]])};
    const result = crsbinding.utils.clone(source, eventSource);
    expect(result.test).toBe(source.test);
    expect(result).not.toBe(source);
});

test("clone - observed", () => {
    const source = crsbinding.observation.observe({test: "testing"});
    source.site = crsbinding.observation.observe({code: "A11"});

    const eventSource = {__events: new Map([["key", "value"]])};
    const result = crsbinding.utils.clone(source, eventSource);

    expect(result.test).toBe(source.test);
    expect(result).not.toBe(source);
    expect(result.site.code).toBe(source.site.code);
    expect(result.site).not.toBe(source.site);
});