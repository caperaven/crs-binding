import { describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
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

    it("attribute - if attr - standard", async () => {
        const element = new ElementMock("div");
        element.setAttribute("hidden.if", "code == 'A11'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assert(element.getAttribute("hidden") != null);

        element.setAttribute("hidden.if", "code == 'A11'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A12"});
        assert(element.getAttribute("hidden") == null);
    })

    it("attribute - if attr - true / undefined", async () => {
        const element = new ElementMock("div");
        element.setAttribute("data-code.if", "code == 'A11' ? 'a'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assert(element.getAttribute("data-code") == 'a');

        element.setAttribute("data-code.if", "code == 'A11' ? 'a'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A12"});
        assert(element.getAttribute("data-code") == null);
    });

    it("attribute - if attr - value1 or value 2", async () => {
        const element = new ElementMock("div");
        element.setAttribute("data-code.if", "code == 'A11' ? 'a' : 'b'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assert(element.getAttribute("data-code") == 'a');

        element.setAttribute("data-code.if", "code == 'A11' ? 'a' : 'b'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A12"});
        assert(element.getAttribute("data-code") == 'b');
    });

    it ("attribute - if style", async () => {
        const element = new ElementMock("div");
        element.setAttribute("style.color.if", "code == 'A11' ? 'red'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assert(element.style.color == 'red');

        element.setAttribute("style.color.if", "code == 'A11' ? 'red'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A12"});
        assert(element.style.color == '');
    })

    it ("attribute - if else style", async () => {
        const element = new ElementMock("div");
        element.setAttribute("style.color.if", "code == 'A11' ? 'red' : 'blue'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assert(element.style.color == 'red');

        element.setAttribute("style.color.if", "code == 'A11' ? 'red' : 'blue'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A12"});
        assert(element.style.color == 'blue');
    })

    it ("attribute - if classlist", async () => {
        const element = new ElementMock("div");
        element.setAttribute("classlist.if", "code == 'A11' ? 'red'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assert(element.classList.contains("red") == true);

        element.setAttribute("classlist.if", "code == 'A11' ? 'red'");
        element.classList._clear();
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A12"});
        assert(element.classList.contains("red") == false);
    })

    it ("attribute - if else classtlist", async () => {
        const element = new ElementMock("div");
        element.setAttribute("classlist.if", "code == 'A11' ? 'red' : 'blue'");
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A11"});
        assert(element.classList.contains('red') == true);
        assert(element.classList.contains('blue') == false);

        element.setAttribute("style.color.if", "code == 'A11' ? 'red' : 'blue'");
        element.classList._clear();
        await crsbinding.staticInflationManager.inflateElement(element, {code: "A12"});
        assert(element.classList.contains('red') == false);
        assert(element.classList.contains('blue') == true);
    })
    //
    // it ("attribute - if classlist array", async () => {
    //
    // });
})


