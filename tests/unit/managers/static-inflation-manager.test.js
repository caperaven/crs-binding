import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {ElementMock} from "../../mockups/element-mock.js";
import {init} from "./../../mockups/init.js";

await init();

Deno.test("static inflation manager - ${code}", async () => {
    const element = new ElementMock("div");
    element.textContent = "${code}";

    crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
    assertEquals(element.textContent, "A11");
})

Deno.test("static inflation manager - &{code} translation", async () => {
    await crsbinding.translations.add({
        "code": "Code"
    })

    const element = new ElementMock("div");
    element.textContent = "&{code}";

    await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
    assertEquals(element.textContent, "Code");
})