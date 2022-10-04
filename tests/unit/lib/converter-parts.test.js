import { assertEquals, assertNotEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {getConverterParts} from "./../../../src/lib/converter-parts.js";

Deno.test("converter parts - simple", async () => {
    const parts = getConverterParts("char:ascii()");

    assertEquals(parts.path, "char");
    assertEquals(parts.converter, "ascii");
    assertEquals(parts.parameter, null);
    assertEquals(parts.postExp, "");
})

Deno.test("converter parts - simple with parameters", async () => {
    const parts = getConverterParts("char:ascii({'case': 'upper'})");

    assertEquals(parts.path, "char");
    assertEquals(parts.converter, "ascii");
    assertEquals(parts.parameter.case, "upper");
    assertEquals(parts.postExp, "");
})

Deno.test("converter parts - simple with parameters and trailing js", async () => {
    const parts = getConverterParts("char:ascii({'case': 'upper'}).value.trim()");

    assertEquals(parts.path, "char");
    assertEquals(parts.converter, "ascii");
    assertEquals(parts.parameter.case, "upper");
    assertEquals(parts.postExp, ".value.trim()");
})

Deno.test("converter parts - path with parameters and trailing js", async () => {
    const parts = getConverterParts("model.char:ascii({'case': 'upper'}).value.trim()");

    assertEquals(parts.path, "model.char");
    assertEquals(parts.converter, "ascii");
    assertEquals(parts.parameter.case, "upper");
    assertEquals(parts.postExp, ".value.trim()");
})