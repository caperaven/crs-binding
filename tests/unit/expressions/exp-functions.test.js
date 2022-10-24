import { beforeAll, afterAll, afterEach, beforeEach, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import { assertEquals, assertExists, assert } from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {ElementMock} from "../../mockups/element-mock.js";
import {init} from "./../../mockups/init.js";

await init();

describe("function compilation tests", async () => {
    it( "ifFunction", async () => {
        let fn = await crsbinding.expression.ifFunction("code == 'a'");
        assertEquals(fn({code: "a"}), true)
        assertEquals(fn({code: "b"}), false)

        fn = await crsbinding.expression.ifFunction("code == 'a' ? true");
        assertEquals(fn({code: "a"}), true)
        assertEquals(fn({code: "b"}), undefined)

        fn = await crsbinding.expression.ifFunction("code == 'a' ? true : false");
        assertEquals(fn({code: "a"}), true)
        assertEquals(fn({code: "b"}), false)
    })

    it ("caseFunction", async () => {
        let fn = await crsbinding.expression.caseFunction("value < 10: 'yes', value < 20: 'ok', default: 'no'");
        let value1 = fn({value: 5});
        let value2 = fn({value: 15});
        let value3 = fn({value: 25})

        assertEquals(value1, 'yes');
        assertEquals(value2, 'ok');
        assertEquals(value3, 'no');

        fn = await crsbinding.expression.caseFunction("value < 10: 'yes', value < 20: 'ok'");
        value1 = fn({value: 5});
        value2 = fn({value: 15});
        value3 = fn({value: 25})

        assertEquals(value1, 'yes');
        assertEquals(value2, 'ok');
        assertEquals(value3, undefined);
    })
})