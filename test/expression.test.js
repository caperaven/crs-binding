import {sanitize} from "./../src/expressions.js"

test("sanitize - simple", () => {
   const result = sanitize("property1 == 'a'");
   expect(result.properties.indexOf("property1")).not.toBe("-1");
   expect(result.expression).toBe("context.property1 == 'a'");
   expect(result.isLiteral).toBe(false);
});

test("sanitize - with function", () => {
   const result = sanitize("property1.toUpper() == 'A'");
   expect(result.properties.indexOf("property1")).not.toBe("-1");
   expect(result.expression).toBe("context.property1.toUpper() == 'A'");
   expect(result.isLiteral).toBe(false);
});

test("sanitize - composite", () => {
   const result = sanitize("${model.name} is ${model.age} old");
   expect(result.properties[0]).toBe("model.name");
   expect(result.properties[1]).toBe("model.age");
   expect(result.expression).toBe("${context.model.name} is ${context.model.age} old");
   expect(result.isLiteral).toBe(true);
});

test("sanitize - expression", () => {
   const result = sanitize("${1 + 1 + property1}");
   expect(result.properties[0]).toBe("property1");
   expect(result.expression).toBe("${1 + 1 + context.property1}");
   expect(result.isLiteral).toBe(true);
});