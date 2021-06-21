import {sanitizeExp} from "../../src/expressions/exp-sanitizer.js"

test ("sanitizeExp - globals variable", () => {
   const result = sanitizeExp("$globals.menu.isVisible = !$globals.menu.isVisible");
   expect(result.expression).toBe("crsbinding.data.globals.menu.isVisible = !crsbinding.data.globals.menu.isVisible");
   expect(result.properties.length).toBe(1);
   expect(result.properties[0]).toBe("$globals.menu.isVisible");
})

test("sanitizeExp - exp = context", () => {
   expect(sanitizeExp("color", "color").expression).toBe("color");
   expect(sanitizeExp("${color}", "color").expression).toBe("${color}");
})

test("sanitizeExp - single assignment expression", () => {
   const result = sanitizeExp("value1 == value2");
   expect(result.expression).toBe("context.value1 == context.value2");
   expect(result.properties[0]).toBe("value1");
   expect(result.properties[1]).toBe("value2");
});

test("sanitizeExp - single assignment expression", () => {
   const result = sanitizeExp("value1 === value2");
   expect(result.expression).toBe("context.value1 === context.value2");
   expect(result.properties[0]).toBe("value1");
   expect(result.properties[1]).toBe("value2");
});

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
   expect(result.properties[0]).toBe("address.street");
});

test ("sanitizeExp - special string", () => {
   const result = sanitizeExp("value == 'v-height'");
   expect(result.expression).toBe("context.value == 'v-height'");
});

test ("sanitizeExp - when", () => {
   const result = sanitizeExp("firstName == 'John' && lastName == 'Doe'");
   expect(result.expression).toBe("context.firstName == 'John' && context.lastName == 'Doe'");
   expect(result.properties[0]).toBe("firstName");
   expect(result.properties[1]).toBe("lastName");
});

test ("sanitizeExp - string token", () => {
   const result = sanitizeExp("${firstName} ${lastName} is ${age} old and lives at \"${address.street}\"");
   expect(result.expression).toBe("${context.firstName} ${context.lastName} is ${context.age} old and lives at \"${context.address.street}\"")
   expect(result.properties[0]).toBe("firstName");
   expect(result.properties[1]).toBe("lastName");
   expect(result.properties[2]).toBe("age");
   expect(result.properties[3]).toBe("address.street");
});

test("sanitizeExp - ignore named expression", () => {
   const result = sanitizeExp("person.firstName", "person");
   expect(result.expression).toBe("person.firstName");
   expect(result.properties[0]).toBe("firstName");
});

test("sanitizeExp - ignore named expression - multiple", () => {
   const result = sanitizeExp("person.firstName && person.lastName", "person");
   expect(result.expression).toBe("person.firstName && person.lastName");
   expect(result.properties[0]).toBe("firstName");
   expect(result.properties[1]).toBe("lastName");
});

test("sanitizeExp - ignore null", () => {
   const result = sanitizeExp("validation.editing == null", "context");
   expect(result.expression).toBe("context.validation.editing == null");
   expect(result.properties[0]).toBe("validation.editing");
});

test("sanitizeExp - array in expression", () => {
   const result = sanitizeExp("arrayfield != null || arrayfield.length == 0", "person");
   expect(result.expression).toBe("person.arrayfield != null || person.arrayfield.length == 0");
   expect(result.properties[0]).toBe("arrayfield");
   expect(result.properties[1]).toBe("arrayfield.length");
});

test("sanitizeExp - array in expression", () => {
   const result = sanitizeExp("arrayfield.length == 0 || arrayfield.length == 5", "person");
   expect(result.expression).toBe("person.arrayfield.length == 0 || person.arrayfield.length == 5");
   expect(result.properties[0]).toBe("arrayfield.length");
   expect(result.properties.length).toBe(1);
});

test("sanitizeExp - set object", () => {
   const result = sanitizeExp("$globals.date = {title: ${title}}");
   expect(result.expression).toBe("crsbinding.data.globals.date = {title: ${context.title}}");
   expect(result.properties[0]).toBe("$globals.date");
   expect(result.properties[1]).toBe("title");
});

test("sanitizeExp - set object with event", () => {
   const result = sanitizeExp("{ x: $event.x, y: $event.y }");
   expect(result.expression).toBe("{ x: event.x, y: event.y }");
   expect(result.properties.length).toBe(0);
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

test("sanitizeExp - $event.target", () => {
   const result = sanitizeExp("$event.target");
   expect(result.expression).toBe("event.target");
   expect(result.properties.length).toBe(0);
});

test("sanitizeExp - $parentId in expression", () => {
   const result = sanitizeExp("$parent.property1 == item.property2", "item");
   expect(result.expression).toBe("parent.property1 == item.property2");

   expect(result.properties[0]).toBe("$parent.property1");
   expect(result.properties[1]).toBe("property2");
});

test("sanitizeExp - $data", () => {
   const result = sanitizeExp("selectedObj = $data($event.target.dataset.id)");
   expect(result.expression).toBe("context.selectedObj = crsbinding.data.getValue(event.target.dataset.id)");
   expect(result.properties.length).toBe(1);
   expect(result.properties[0]).toBe("selectedObj");
});

test("sanitizeExp - inner-text", () => {
   const result = sanitizeExp("This is the ${item.position} article", "item");
   expect(result.expression).toBe("This is the ${item.position} article");
   expect(result.properties[0]).toBe("position");
});

test("sanitizeExp - keywords", () => {
   let result = sanitizeExp("true");
   expect(result.expression).toBe("true");

   result = sanitizeExp("false");
   expect(result.expression).toBe("false");

   result = sanitizeExp("null");
   expect(result.expression).toBe("null");

   result = sanitizeExp(true);
   expect(result.expression).toBe(true);

   result = sanitizeExp(false);
   expect(result.expression).toBe(false);

   result = sanitizeExp(null);
   expect(result.expression).toBe(null);

   result = sanitizeExp(10);
   expect(result.expression).toBe(10);

   result = sanitizeExp("10");
   expect(result.expression).toBe("10");

})

test("sanitizeExp - expression with (....)", () => {
   const result = sanitizeExp("model.monitoringPointTriggerExpressionId != null || (model.status == 'CancelledByUser' || model.status == 'CancelledBySystem' || model.status == 'Closed')");
   expect(result.expression).toBe("context.model.monitoringPointTriggerExpressionId != null || (context.model.status == 'CancelledByUser' || context.model.status == 'CancelledBySystem' || context.model.status == 'Closed')");
   expect(result.properties.length).toBe(2);
   expect(result.properties[0]).toBe("model.monitoringPointTriggerExpressionId");
   expect(result.properties[1]).toBe("model.status");
});

test("sanitize - expression with (...) simple combined with function", () => {
   const result = sanitizeExp("(model.property.isValid() == true)");
   expect(result.expression).toBe("(context.model.property.isValid() == true)");
   expect(result.properties[0]).toBe("model.property");
})

test("sanitize - expression with (...) simple combined with function and parameters", () => {
   const result = sanitizeExp("(model.property.isValid('abc', 10) == true)");
   expect(result.expression).toBe("(context.model.property.isValid('abc', 10) == true)");
   expect(result.properties[0]).toBe("model.property");
})

test("sanitize - expression with (()) simple", () => {
   const result = sanitizeExp("(model.isOpen == true) || (model.isOpen == null)");
   expect(result.expression).toBe("(context.model.isOpen == true) || (context.model.isOpen == null)");
   expect(result.properties[0]).toBe("model.isOpen");
})

test("sanitize - expression with (()) complex", () => {
   const result = sanitizeExp("((model.isOpen == true) || (model.isOpen == null))");
   expect(result.expression).toBe("((context.model.isOpen == true) || (context.model.isOpen == null))");
   expect(result.properties[0]).toBe("model.isOpen");
})

test("sanitize - function", () => {
   const result = sanitizeExp("`rotate(${angle}deg)`");
   expect(result.expression).toBe("`rotate(${context.angle}deg)`");
   expect(result.properties[0]).toBe("angle");
})

test("sanitize - calculated string", () => {
   const result = sanitizeExp("`${(rect.x / 2)}px ${(rect.y / 2)}px`");
   expect(result.expression).toBe("`${(context.rect.x / 2)}px ${(context.rect.y / 2)}px`");
   expect(result.properties[0]).toBe("rect.x");
   expect(result.properties[1]).toBe("rect.y");
})

test("sanitize - html", () => {
   const result = sanitizeExp("$html.model.property");
   expect(result.isHTML).toBeTruthy();
   expect(result.expression).toBe("context.model.property");
})

test("sanitize - expression", () => {
   const result = sanitizeExp("${model.siteCode == 'A21' ? 'Hello A21' : model.code}");
   expect(result.expression).toBe("${context.model.siteCode == 'A21' ? 'Hello A21' : context.model.code}");
})

test("sanitize - expression literal", () => {
   const result = sanitizeExp("`${model.siteCode == 'A21' ? 'Hello A21' : model.code}`");
   expect(result.expression).toBe("`${context.model.siteCode == 'A21' ? 'Hello A21' : context.model.code}`");
})

test("sanitize - Not expressions", () => {
   const result = sanitizeExp("!isActive");
   expect(result.expression).toBe("!context.isActive");
})

test("sanitize - Not expressions on path", () => {
   const result = sanitizeExp("!model.isActive");
   expect(result.expression).toBe("!context.model.isActive");
})

test("sanitize - Not expressions in literals", () => {
   const result = sanitizeExp("`!model.isActive`");
   expect(result.expression).toBe("`!context.model.isActive`");
})

test("sanitize - Not expressions in expressions", () => {
   const result = sanitizeExp("!isActive && !isOn");
   expect(result.expression).toBe("!context.isActive && !context.isOn");
})

test("sanitize - Not expression with prefix", () => {
   const result = sanitizeExp("!$globals.isActive");
   expect(result.expression).toBe("!crsbinding.data.globals.isActive")
})

test("sanitize - Bracket array check", () => {
   const result = sanitizeExp("(schema.variable.items || []).length == 0)");
   expect(result.expression).toBe("(context.schema.variable.items || []).length == 0)");
})

test("sanitizeExp - attribute condition", () => {
   const result = sanitizeExp("${$context.item.value == true ? '#checked' : '#unchecked'}", "item");
   expect(result.expression).toBe("${context.item.value == true ? '#checked' : '#unchecked'}");
})

test("sanitizeExp - context condition expression", () => {
   const result = sanitizeExp("context.isDialog == true ? true : false");
   expect(result.expression).toBe("context.context.isDialog == true ? true : false");
})