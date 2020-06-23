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

test ("sanitizeExp - string token", () => {
   const result = sanitizeExp("${firstName} ${lastName} is ${age} old and lives at \"${address.street}\"");
   expect(result.expression).toBe("${context.firstName} ${context.lastName} is ${context.age} old and lives at \"${context.address.street}\"")
});

test("sanitizeExp - ignore named expression", () => {
   const result = sanitizeExp("person.firstName", "person");
   expect(result.expression).toBe("person.firstName");
});

test("sanitizeExp - ignore named expression - multiple", () => {
   const result = sanitizeExp("person.firstName && person.lastName", "person");
   expect(result.expression).toBe("person.firstName && person.lastName");
});

test("sanitizeExp - ignore null", () => {
   const result = sanitizeExp("validation.editing == null", "context");
   expect(result.expression).toBe("context.validation.editing == null");
});

test("sanitizeExp - array in expression", () => {
   const result = sanitizeExp("arrayfield != null || arrayfield.length == 0", "person");
   expect(result.expression).toBe("person.arrayfield != null || person.arrayfield.length == 0");
});

test("sanitizeExp - array in expression", () => {
   const result = sanitizeExp("arrayfield.length == 0 || arrayfield.length == 5", "person");
   expect(result.expression).toBe("person.arrayfield.length == 0 || person.arrayfield.length == 5");
});

test("sanitizeExp - set object", () => {
   const result = sanitizeExp("$globals.date = {title: ${title}}");
   expect(result.expression).toBe("crsbinding.data.globals.date = {title: ${context.title}}")
});

test("sanitizeExp - set object with event", () => {
   const result = sanitizeExp("{ x: $event.x, y: $event.y }");
   expect(result.expression).toBe("{ x: event.x, y: event.y }");
});

test("sanitizeExp - toggle boolean", () => {
   const result = sanitizeExp("$context.isOpen = !$context.isOpen");
   expect(result.expression).toBe("context.isOpen = !context.isOpen");
});

test("sanitizeExp - !$context.expression", () => {
   const result = sanitizeExp("!$context.isOpen");
   expect(result.expression).toBe("!context.isOpen");
});

test("sanitizeExp - !expression", () => {
   const result = sanitizeExp("${!isOpen}");
   expect(result.expression).toBe("${!context.isOpen}");
});