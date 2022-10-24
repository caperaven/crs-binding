import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {ElementMock} from "../../mockups/element-mock.js";
import {init} from "./../../mockups/init.js";

await init();

describe("static inflation manager", async () => {
    it("text content - ${code}", async () => {
        const element = new ElementMock("div");
        element.textContent = "${code}";

        crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assertEquals(element.textContent, "A11");
    })

    it("text content - &{code} translation", async () => {
        await crsbinding.translations.add({
            "code": "Code"
        })

        const element = new ElementMock("div");
        element.textContent = "&{code}";

        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assertEquals(element.textContent, "Code");
    })

    it("attribute - .attr", async () => {
        const element = new ElementMock("div");
        element.setAttribute("value.attr", "test ${code}")

        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assertEquals(element.getAttribute("value"), "test A11");
    })
})


