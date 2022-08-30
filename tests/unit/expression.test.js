import { assertEquals, assertNotEquals } from "https://deno.land/std@0.153.0/testing/asserts.ts";
import {sanitizeExp} from "../../src/expressions/exp-sanitizer.js"

Deno.test("sanitizeExp - globals variable", () => {
   const result = sanitizeExp("$globals.menu.isVisible = !$globals.menu.isVisible");
   assertEquals(result.expression, "crsbinding.data.globals.menu.isVisible = !crsbinding.data.globals.menu.isVisible");
   assertEquals(result.properties.length, 1);
   assertEquals(result.properties[0], "$globals.menu.isVisible");
})

Deno.test("sanitizeExp - exp = context", () => {
   assertEquals(sanitizeExp("color", "color").expression, "color");
   assertEquals(sanitizeExp("${color}", "color").expression, "${color}");
})

Deno.test("sanitizeExp - single assignment expression", () => {
   const result = sanitizeExp("value1 == value2");
   assertEquals(result.expression, "context.value1 == context.value2");
   assertEquals(result.properties[0], "value1");
   assertEquals(result.properties[1], "value2");
});

Deno.test("sanitizeExp - single assignment expression", () => {
   const result = sanitizeExp("value1 === value2");
   assertEquals(result.expression, "context.value1 === context.value2");
   assertEquals(result.properties[0], "value1");
   assertEquals(result.properties[1], "value2");
});

Deno.test("sanitizeExp - single", () => {
   const result = sanitizeExp("name");
   assertEquals(result.properties[0], "name");
   assertEquals(result.expression, "context.name");
});

Deno.test("sanitizeExp - simple", () => {
   const result = sanitizeExp("property1 == 'a'");
   assertNotEquals(result.properties.indexOf("property1"), "-1");
   assertEquals(result.expression, "context.property1 == 'a'");
   assertEquals(result.isLiteral, false);
});

Deno.test("sanitizeExp - with function", () => {
   const result = sanitizeExp("property1.toUpper() == 'A'");
   assertNotEquals(result.properties.indexOf("property1"), "-1");
   assertEquals(result.expression, "context.property1.toUpper() == 'A'");
   assertEquals(result.isLiteral, false);
});

Deno.test("sanitizeExp - composite", () => {
   const result = sanitizeExp("${model.name} is ${model.age} old");
   assertEquals(result.properties[0], "model.name");
   assertEquals(result.properties[1], "model.age");
   assertEquals(result.expression, "${context.model.name} is ${context.model.age} old");
   assertEquals(result.isLiteral, true);
});

Deno.test("sanitizeExp - expression", () => {
   const result = sanitizeExp("${1 + 1 + property1}");
   assertEquals(result.properties[0], "property1");
   assertEquals(result.expression, "${1 + 1 + context.property1}");
   assertEquals(result.isLiteral, true);
});

Deno.test("sanitizeExp - multiple functions", () => {
   const result = sanitizeExp("${firstName.trim().toLowerCase()} > ${lastName.trim().toLowerCase()}");
   assertEquals(result.expression, "${context.firstName.trim().toLowerCase()} > ${context.lastName.trim().toLowerCase()}");
   assertEquals(result.properties[0], "firstName");
   assertEquals(result.properties[1], "lastName");
   assertEquals(result.isLiteral, true);
});

Deno.test("sanitizeExp - conditional value", () => {
   const result = sanitizeExp("title == 'a' ? true : false");
   assertEquals(result.expression, "context.title == 'a' ? true : false");
   assertEquals(result.properties.length, 1);
   assertEquals(result.properties[0], "title");
});

Deno.test("sanitizeExp - path", () => {
   const result = sanitizeExp("address.street");
   assertEquals(result.expression, "context.address.street");
   assertEquals(result.properties[0], "address.street");
});

Deno.test("sanitizeExp - special string", () => {
   const result = sanitizeExp("value == 'v-height'");
   assertEquals(result.expression, "context.value == 'v-height'");
});

Deno.test("sanitizeExp - when", () => {
   const result = sanitizeExp("firstName == 'John' && lastName == 'Doe'");
   assertEquals(result.expression, "context.firstName == 'John' && context.lastName == 'Doe'");
   assertEquals(result.properties[0], "firstName");
   assertEquals(result.properties[1], "lastName");
});

Deno.test("sanitizeExp - string token", () => {
   const result = sanitizeExp("${firstName} ${lastName} is ${age} old and lives at \"${address.street}\"");
   assertEquals(result.expression, "${context.firstName} ${context.lastName} is ${context.age} old and lives at \"${context.address.street}\"")
   assertEquals(result.properties[0], "firstName");
   assertEquals(result.properties[1], "lastName");
   assertEquals(result.properties[2], "age");
   assertEquals(result.properties[3], "address.street");
});

Deno.test("sanitizeExp - ignore named expression", () => {
   const result = sanitizeExp("person.firstName", "person");
   assertEquals(result.expression, "person.firstName");
   assertEquals(result.properties[0], "firstName");
});

Deno.test("sanitizeExp - ignore named expression - multiple", () => {
   const result = sanitizeExp("person.firstName && person.lastName", "person");
   assertEquals(result.expression, "person.firstName && person.lastName");
   assertEquals(result.properties[0], "firstName");
   assertEquals(result.properties[1], "lastName");
});

Deno.test("sanitizeExp - ignore null", () => {
   const result = sanitizeExp("validation.editing == null", "context");
   assertEquals(result.expression, "context.validation.editing == null");
   assertEquals(result.properties[0], "validation.editing");
});

Deno.test("sanitizeExp - array in expression", () => {
   const result = sanitizeExp("arrayfield != null || arrayfield.length == 0", "person");
   assertEquals(result.expression, "person.arrayfield != null || person.arrayfield.length == 0");
   assertEquals(result.properties[0], "arrayfield");
   assertEquals(result.properties[1], "arrayfield.length");
});

Deno.test("sanitizeExp - array in expression", () => {
   const result = sanitizeExp("arrayfield.length == 0 || arrayfield.length == 5", "person");
   assertEquals(result.expression, "person.arrayfield.length == 0 || person.arrayfield.length == 5");
   assertEquals(result.properties[0], "arrayfield.length");
   assertEquals(result.properties.length, 1);
});

Deno.test("sanitizeExp - set object", () => {
   const result = sanitizeExp("$globals.date = {title: ${title}}");
   assertEquals(result.expression, "crsbinding.data.globals.date = {title: ${context.title}}");
   assertEquals(result.properties[0], "$globals.date");
   assertEquals(result.properties[1], "title");
});

Deno.test("sanitizeExp - set object with event", () => {
   const result = sanitizeExp("{ x: $event.x, y: $event.y }");
   assertEquals(result.expression, "{ x: event.x, y: event.y }");
   assertEquals(result.properties.length, 0);
});

Deno.test("sanitizeExp - toggle boolean", () => {
   const result = sanitizeExp("$context.isOpen = !$context.isOpen");
   assertEquals(result.expression, "context.isOpen = !context.isOpen");
});

Deno.test("sanitizeExp - !$context.expression", () => {
   const result = sanitizeExp("!$context.isOpen");
   assertEquals(result.expression, "!context.isOpen");
});

Deno.test("sanitizeExp - !expression", () => {
   const result = sanitizeExp("${!isOpen}");
   assertEquals(result.expression, "${!context.isOpen}");
});

Deno.test("sanitizeExp - $event.target", () => {
   const result = sanitizeExp("$event.target");
   assertEquals(result.expression, "event.target");
   assertEquals(result.properties.length, 0);
});

Deno.test("sanitizeExp - $parentId in expression", () => {
   const result = sanitizeExp("$parent.property1 == item.property2", "item");
   assertEquals(result.expression, "parent.property1 == item.property2");

   assertEquals(result.properties[0], "$parent.property1");
   assertEquals(result.properties[1], "property2");
});

Deno.test("sanitizeExp - $data", () => {
   const result = sanitizeExp("selectedObj = $data($event.target.dataset.id)");
   assertEquals(result.expression, "context.selectedObj = crsbinding.data.getValue(event.target.dataset.id)");
   assertEquals(result.properties.length, 1);
   assertEquals(result.properties[0], "selectedObj");
});

Deno.test("sanitizeExp - inner-text", () => {
   const result = sanitizeExp("This is the ${item.position} article", "item");
   assertEquals(result.expression, "This is the ${item.position} article");
   assertEquals(result.properties[0], "position");
});

Deno.test("sanitizeExp - keywords", () => {
   let result = sanitizeExp("true");
   assertEquals(result.expression, "true");

   result = sanitizeExp("false");
   assertEquals(result.expression, "false");

   result = sanitizeExp("null");
   assertEquals(result.expression, "null");

   result = sanitizeExp(true);
   assertEquals(result.expression, true);

   result = sanitizeExp(false);
   assertEquals(result.expression, false);

   result = sanitizeExp(null);
   assertEquals(result.expression, null);

   result = sanitizeExp(10);
   assertEquals(result.expression, 10);

   result = sanitizeExp("10");
   assertEquals(result.expression, "10");

})

Deno.test("sanitizeExp - expression with (....)", () => {
   const result = sanitizeExp("model.monitoringPointTriggerExpressionId != null || (model.status == 'CancelledByUser' || model.status == 'CancelledBySystem' || model.status == 'Closed')");
   assertEquals(result.expression, "context.model.monitoringPointTriggerExpressionId != null || (context.model.status == 'CancelledByUser' || context.model.status == 'CancelledBySystem' || context.model.status == 'Closed')");
   assertEquals(result.properties.length, 2);
   assertEquals(result.properties[0], "model.monitoringPointTriggerExpressionId");
   assertEquals(result.properties[1], "model.status");
});

Deno.test("sanitize - expression with (...) simple combined with function", () => {
   const result = sanitizeExp("(model.property.isValid() == true)");
   assertEquals(result.expression, "(context.model.property.isValid() == true)");
   assertEquals(result.properties[0], "model.property");
})

Deno.test("sanitize - expression with (...) simple combined with function and parameters", () => {
   const result = sanitizeExp("(model.property.isValid('abc', 10) == true)");
   assertEquals(result.expression, "(context.model.property.isValid('abc', 10) == true)");
   assertEquals(result.properties[0], "model.property");
})

Deno.test("sanitize - expression with (()) simple", () => {
   const result = sanitizeExp("(model.isOpen == true) || (model.isOpen == null)");
   assertEquals(result.expression, "(context.model.isOpen == true) || (context.model.isOpen == null)");
   assertEquals(result.properties[0], "model.isOpen");
})

Deno.test("sanitize - expression with (()) complex", () => {
   const result = sanitizeExp("((model.isOpen == true) || (model.isOpen == null))");
   assertEquals(result.expression, "((context.model.isOpen == true) || (context.model.isOpen == null))");
   assertEquals(result.properties[0], "model.isOpen");
})

Deno.test("sanitize - function", () => {
   const result = sanitizeExp("`rotate(${angle}deg)`");
   assertEquals(result.expression, "`rotate(${context.angle}deg)`");
   assertEquals(result.properties[0], "angle");
})

Deno.test("sanitize - calculated string", () => {
   const result = sanitizeExp("`${(rect.x / 2)}px ${(rect.y / 2)}px`");
   assertEquals(result.expression, "`${(context.rect.x / 2)}px ${(context.rect.y / 2)}px`");
   assertEquals(result.properties[0], "rect.x");
   assertEquals(result.properties[1], "rect.y");
})

Deno.test("sanitize - html", () => {
   const result = sanitizeExp("$html.model.property");
   assertEquals(result.isHTML, true);
   assertEquals(result.expression, "context.model.property");
})

Deno.test("sanitize - expression", () => {
   const result = sanitizeExp("${model.siteCode == 'A21' ? 'Hello A21' : model.code}");
   assertEquals(result.expression, "${context.model.siteCode == 'A21' ? 'Hello A21' : context.model.code}");
})

Deno.test("sanitize - expression literal", () => {
   const result = sanitizeExp("`${model.siteCode == 'A21' ? 'Hello A21' : model.code}`");
   assertEquals(result.expression, "`${context.model.siteCode == 'A21' ? 'Hello A21' : context.model.code}`");
})

Deno.test("sanitize - Not expressions", () => {
   const result = sanitizeExp("!isActive");
   assertEquals(result.expression, "!context.isActive");
})

Deno.test("sanitize - Not expressions on path", () => {
   const result = sanitizeExp("!model.isActive");
   assertEquals(result.expression, "!context.model.isActive");
})

Deno.test("sanitize - Not expressions in literals", () => {
   const result = sanitizeExp("`!model.isActive`");
   assertEquals(result.expression, "`!context.model.isActive`");
})

Deno.test("sanitize - Not expressions in expressions", () => {
   const result = sanitizeExp("!isActive && !isOn");
   assertEquals(result.expression, "!context.isActive && !context.isOn");
})

Deno.test("sanitize - Not expression with prefix", () => {
   const result = sanitizeExp("!$globals.isActive");
   assertEquals(result.expression, "!crsbinding.data.globals.isActive")
})

Deno.test("sanitize - Bracket array check", () => {
   const result = sanitizeExp("(schema.variable.items || []).length == 0)");
   assertEquals(result.expression, "(context.schema.variable.items || []).length == 0)");
})

Deno.test("sanitizeExp - attribute condition", () => {
   const result = sanitizeExp("${$context.item.value == true ? '#checked' : '#unchecked'}", "item");
   assertEquals(result.expression, "${context.item.value == true ? '#checked' : '#unchecked'}");
})

Deno.test("sanitizeExp - context condition expression", () => {
   const result = sanitizeExp("context.isDialog == true ? true : false");
   assertEquals(result.expression, "context.context.isDialog == true ? true : false");
})

Deno.test("sanitizeExp - if true property", () => {
   const result = sanitizeExp("columnSpan != null ? columnSpan : ''");
   assertEquals(result.expression, "context.columnSpan != null ? context.columnSpan : ''");
})

Deno.test("sanitizeExp - if false property", () => {
   const result = sanitizeExp("columnSpan != null ? '' : defaultSpan");
   assertEquals(result.expression, "context.columnSpan != null ? '' : context.defaultSpan");
})

Deno.test("sanitizeExp - object literal", () => {
   const result = sanitizeExp("Selected Person Value: ${selectedPerson}");
   assertEquals(result.expression, "Selected Person Value: ${context.selectedPerson}");
})

Deno.test("sanitizeExp - function on context", () => {
   const result = sanitizeExp("getInitialValue('code')");
   assertEquals(result.expression, "context.getInitialValue('code')");
})

Deno.test("sanitizeExp - composite string", () => {
   const result = sanitizeExp("Selected Animal Value: ${selectedAnimal}");
   assertEquals(result.expression, "Selected Animal Value: ${context.selectedAnimal}");
})