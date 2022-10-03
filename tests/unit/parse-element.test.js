import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {init} from "./../mockups/init.js";
import {createMockChildren} from "./../mockups/child-mock-factory.js"

await init();

beforeAll(async () => {
    await import("./../components/parse-element/parse-element.js");
})

describe("parse-element", async () => {
    let instance;

    beforeEach(async () => {
        instance = document.createElement("parse-element");
        instance.onHTML = () => createMockChildren(instance);
        await instance.connectedCallback();
    })

    it("initialized", async () => {
        assert(instance != null);
        assert(instance.innerHTML != null);

        const translation = instance.querySelector('[data-id="translation"]');
        const binding1 = instance.querySelector('[data-id="binding1"]');

        assertEquals(translation.textContent, "First Name");
        assertEquals(binding1.textContent, "John");
    })
})
