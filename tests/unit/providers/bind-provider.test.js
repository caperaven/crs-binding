import {beforeAll, describe, it} from "https://deno.land/std@0.157.0/testing/bdd.ts";
import {assertEquals} from "https://deno.land/std@0.149.0/testing/asserts.ts";
import {init} from "./../../mockups/init.js";

await init();
let module, instance;

beforeAll(async () => {
    module = await import("./../../../src/binding/providers/bind-provider.js");
});

describe("bind-provider", async () => {

    it("should set number values to null on clearing input", async () => {
        // Arrange
        const id = crsbinding.data.addObject("value", {value: null});

        const input = document.createElement("input");
        input.type = "number";
        instance = new module.BindProvider(input, id, "value", "value");

        const addEventListener = input.addEventListener;
        input.addEventListener = (event, callback) => {

            addEventListener(event, callback);

            // Act
            input.value = "123";
            input.performEvent("change", input);

            // Assert
            assertEquals(crsbinding.data.getProperty(id, "value"), 123);

            // Act
            input.value = "";
            input.performEvent("change", input);

            // Assert
            assertEquals(crsbinding.data.getProperty(id, "value"), null);
        }
    });
});