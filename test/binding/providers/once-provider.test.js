import {OnceProvider} from "./../../../src/binding/providers/once-provider.js"

test("Once provider - execute", () => {
   const element = {
       value: null
   };

   const context = {
       firstName: "John"
   };

    OnceProvider(element, context, "value", "firstName");
   expect(element.value).toBe("John");
});