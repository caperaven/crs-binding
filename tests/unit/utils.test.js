import { assert, assertEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {disposeProperties} from "../../src/lib/utils.js";

Deno.test("disposeProperties - object literal", async () => {
    const obj = {
        firstName: {},
        lastName: {}
    }

    disposeProperties(obj);

    assert(obj.firstName == null);
    assert(obj.lastName == null);
})