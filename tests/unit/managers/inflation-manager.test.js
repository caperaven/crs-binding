import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {TemplateMock} from "../../mockups/template-mock.js";
import {ElementMock} from "../../mockups/element-mock.js";

import {init} from "./../../mockups/init.js";

await init();

const html = {
    simple: "<div>${firstName}</div><div>${lastName}</div>",
    attr_if: `<div hidden.if="firstName == 'John'" data-john.if="firstName == 'John' ? 'Yes' : 'No'"></div>`
}

beforeAll(async () => {
    const simpleTemplate = new TemplateMock(html.simple)
    await crsbinding.inflationManager.register("test", simpleTemplate);

    const attrIfTemplate = new TemplateMock(html.attr_if);
    await crsbinding.inflationManager.register("attr_if", attrIfTemplate);
})

describe("inflation manager tests", async () => {
    it("register", async () => {
        const item = crsbinding.inflationManager._items.get("test");

        assert(item != null);
    })

    it("get", async () => {
        const fragment = crsbinding.inflationManager.get("test", [{firstName: "John", lastName: "Doe"}]);

        assert(fragment != null);
        assert(fragment.children[0].textContent, "John");
        assert(fragment.children[1].textContent, "Doe");
    })

    it ("attribute if", async () => {
    })
})
