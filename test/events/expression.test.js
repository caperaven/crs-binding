import {sanitizeExp} from "../../src/events/expressions.js"

test("sanitizeExp - single", () => {
   const result = sanitizeExp("name");
   expect(result.properties[0]).toBe("name");
   expect(result.expression).toBe("context.name");
});

test("sanitizeExp - simple", () => {
   const result = sanitizeExp("property1 == 'a'");
   expect(result.properties.indexOf("property1")).not.toBe("-1");
   expect(result.expression).toBe("context.property1 == 'a'");
   expect(result.isLiteral).toBe(false);
});

test("sanitizeExp - with function", () => {
   const result = sanitizeExp("property1.toUpper() == 'A'");
   expect(result.properties.indexOf("property1")).not.toBe("-1");
   expect(result.expression).toBe("context.property1.toUpper() == 'A'");
   expect(result.isLiteral).toBe(false);
});

test("sanitizeExp - composite", () => {
   const result = sanitizeExp("${model.name} is ${model.age} old");
   expect(result.properties[0]).toBe("model.name");
   expect(result.properties[1]).toBe("model.age");
   expect(result.expression).toBe("${context.model.name} is ${context.model.age} old");
   expect(result.isLiteral).toBe(true);
});

test("sanitizeExp - expression", () => {
   const result = sanitizeExp("${1 + 1 + property1}");
   expect(result.properties[0]).toBe("property1");
   expect(result.expression).toBe("${1 + 1 + context.property1}");
   expect(result.isLiteral).toBe(true);
});

test("sanitizeExp - multiple functions", () => {
   const result = sanitizeExp("${firstName.trim().toLowerCase()} > ${lastName.trim().toLowerCase()}");
   expect(result.expression).toBe("${context.firstName.trim().toLowerCase()} > ${context.lastName.trim().toLowerCase()}");
   expect(result.properties[0]).toBe("firstName");
   expect(result.properties[1]).toBe("lastName");
   expect(result.isLiteral).toBe(true);
});

test("sanitizeExp - conditional value", () => {
   const result = sanitizeExp("title == 'a' ? true : false");
   expect(result.expression).toBe("context.title == 'a' ? true : false");
   expect(result.properties.length).toBe(1);
   expect(result.properties[0]).toBe("title");
});

test ("sanitizeExp - path", () => {
   const result = sanitizeExp("address.street");
   expect(result.expression).toBe("context.address.street");
});

test ("sanitizeExp - special string", () => {
   const result = sanitizeExp("value == 'v-height'");
   expect(result.expression).toBe("context.value == 'v-height'");
});

test ("sanitizeExp - when", () => {
   const result = sanitizeExp("firstName == 'John' && lastName == 'Doe'");
   expect(result.expression).toBe("context.firstName == 'John' && context.lastName == 'Doe'")
});