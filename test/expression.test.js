import {sanitizeExp} from "../src/events/expressions.js"

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