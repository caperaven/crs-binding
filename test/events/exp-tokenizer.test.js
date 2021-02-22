import {tokenize} from "../../src/expressions/exp-tokenizer.js"

function assert(token, type, value = " ") {
    expect(token.type).toBe(type);
    expect(token.value).toBe(value);
}

test("tokenize - single world", () => {
    const result = tokenize("color");
    expect(result.length).toBe(1);
    assert(result[0], "property", "color");
})

test("tokenizer - single path", () => {
    const result = tokenize("address.street");
    expect(result.length).toBe(1);
    assert(result[0], "property", "address.street");
})

test("tokenize - string with expression", () => {
    const result = tokenize('"${address.street}"');
    expect(result.length).toBe(5);

    assert(result[0], "string", '"');
    assert(result[1], "keyword", "${");
    assert(result[2], "property", "address.street");
    assert(result[3], "keyword", "}");
    assert(result[4], "string", '"');

})

test("tokenizer - evaluate string expression", () => {
    const result = tokenize("value == 'v-height'");
    expect(result.length).toBe(5);

    assert(result[0], "property", "value");
    assert(result[1], "space");
    assert(result[2], "operator", "==");
    assert(result[3], "space");
    assert(result[4], "string", "'v-height'");
})

test("tokenizer - evaluate string expression", () => {
    const result = tokenize("value == 25");
    expect(result.length).toBe(5);

    assert(result[0], "property", "value");
    assert(result[1], "space");
    assert(result[2], "operator", "==");
    assert(result[3], "space");
    assert(result[4], "number", "25");
})

test("tokenize - single world string literal", () => {
    const result = tokenize("${color}");
    expect(result.length).toBe(3);

    assert(result[0], "keyword", "${");
    assert(result[1], "property", "color");
    assert(result[2], "keyword", "}");
})

test("tokenize - simple expression", () => {
    const result = tokenize("property1 == 'a'");
    expect(result.length).toBe(5);

    assert(result[0], "property", "property1");
    assert(result[1], "space");
    assert(result[2], "operator", "==");
    assert(result[3], "space");
    assert(result[4], "string", "'a'");
})

test("tokenize - simple string literal expression", () => {
    const result = tokenize("property1 == `${value1}`");
    expect(result.length).toBe(9);

    assert(result[0], "property", "property1");
    assert(result[1], "space");
    assert(result[2], "operator", "==");
    assert(result[3], "space");
    assert(result[4], "literal", "`");
    assert(result[5], "keyword", "${");
    assert(result[6], "property", "value1");
    assert(result[7], "keyword", "}");
    assert(result[8], "literal", "`");
})

test("tokenize - simple property with function", () => {
    const result = tokenize("property1.toUpper() == 'A'");
    expect(result.length).toBe(7);

    assert(result[0], "property", "property1.toUpper");
    assert(result[1], "keyword", "(");
    assert(result[2], "keyword", ")");
    assert(result[3], "space");
    assert(result[4], "operator", "==");
    assert(result[5], "space");
    assert(result[6], "string", "'A'");
})

test("tokenize - simple composite expression", () => {
    const result = tokenize("${model.name} is ${model.age} old");
    expect(result.length).toBe(11);

    assert(result[0], "keyword", "${");
    assert(result[1], "property", "model.name");
    assert(result[2], "keyword", "}");
    assert(result[3], "space");
    assert(result[4], "word", "is");
    assert(result[5], "space");
    assert(result[6], "keyword", "${");
    assert(result[7], "property", "model.age");
    assert(result[8], "keyword", "}");
    assert(result[9], "space");
    assert(result[10], "word", "old");
})

test("tokenize - numeric expression with property", () => {
    const result = tokenize("1 + 1 + property1");
    expect(result.length).toBe(9);

    assert(result[0], "number", "1");
    assert(result[1], "space");
    assert(result[2], "operator", "+");
    assert(result[3], "space");
    assert(result[4], "number", "1");
    assert(result[5], "space");
    assert(result[6], "operator", "+");
    assert(result[7], "space");
    assert(result[8], "property", "property1");
})

test("tokenize - numeric expression with property in literal", () => {
    const result = tokenize("${1 + 1 + property1}");
    expect(result.length).toBe(11);

    assert(result[0], "keyword", "${");
    assert(result[1], "number", "1");
    assert(result[2], "space");
    assert(result[3], "operator", "+");
    assert(result[4], "space");
    assert(result[5], "number", "1");
    assert(result[6], "space");
    assert(result[7], "operator", "+");
    assert(result[8], "space");
    assert(result[9], "property", "property1");
    assert(result[10], "keyword", "}");
})

test("tokenize - simple composite expression", () => {
    const result = tokenize("${firstName.trim().toLowerCase()} > ${lastName.trim().toLowerCase()}");
    expect(result.length).toBe(19);

    assert(result[0], "keyword", "${");
    assert(result[1], "property", "firstName.trim");
    assert(result[2], "keyword", "(");
    assert(result[3], "keyword", ")");
    assert(result[4], "word", ".toLowerCase");
    assert(result[5], "keyword", "(");
    assert(result[6], "keyword", ")");
    assert(result[7], "keyword", "}");
    assert(result[8], "space");
    assert(result[9], "operator", ">");
    assert(result[10], "space");
    assert(result[11], "keyword", "${");
    assert(result[12], "property", "lastName.trim");
    assert(result[13], "keyword", "(");
    assert(result[14], "keyword", ")");
    assert(result[15], "word", ".toLowerCase");
    assert(result[16], "keyword", "(");
    assert(result[17], "keyword", ")");
    assert(result[18], "keyword", "}");
})

test("tokenize - simple conditional expression", () => {
    const result = tokenize("title == 'a' ? true : false");
    expect(result.length).toBe(13);

    assert(result[0], "property", "title");
    assert(result[1], "space");
    assert(result[2], "operator", "==");
    assert(result[3], "space");
    assert(result[4], "string", "'a'");
    assert(result[5], "space");
    assert(result[6], "keyword", "?");
    assert(result[7], "space");
    assert(result[8], "keyword", "true");
    assert(result[9], "space");
    assert(result[10], "keyword", ":");
    assert(result[11], "space");
    assert(result[12], "keyword", "false");
})

test("tokenize - simple conditional expression", () => {
    const result = tokenize("firstName == 'John' && lastName == 'Doe'");
    expect(result.length).toBe(13);

    assert(result[0], "property", "firstName");
    assert(result[1], "space");
    assert(result[2], "operator", "==");
    assert(result[3], "space");
    assert(result[4], "string", "'John'");
    assert(result[5], "space");
    assert(result[6], "operator", "&&");
    assert(result[7], "space");
    assert(result[8], "property", "lastName");
    assert(result[9], "space");
    assert(result[10], "operator", "==");
    assert(result[11], "space");
    assert(result[12], "string", "'Doe'");
})

test ("tokenize - not keyword with != operator", () => {
    const result = tokenize("arrayfield != null || arrayfield.length == 0");
    expect(result.length).toBe(13);

    assert(result[0], "property", "arrayfield");
    assert(result[1], "space");
    assert(result[2], "operator", "!=");
    assert(result[3], "space");
    assert(result[4], "keyword", "null");
    assert(result[5], "space");
    assert(result[6], "operator", "||");
    assert(result[7], "space");
    assert(result[8], "property", "arrayfield.length");
    assert(result[9], "space");
    assert(result[10], "operator", "==");
    assert(result[11], "space");
    assert(result[12], "number", "0");
})

test ("tokenize - complex worded expression", () => {
    const result = tokenize('${firstName} ${lastName} is ${age} old and lives at "${address.street}"');
    expect(result.length).toBe(27);

    assert(result[0], "keyword", "${");
    assert(result[1], "property", "firstName");
    assert(result[2], "keyword", "}");
    assert(result[3], "space");
    assert(result[4], "keyword", "${");
    assert(result[5], "property", "lastName");
    assert(result[6], "keyword", "}");
    assert(result[7], "space");
    assert(result[8], "word", "is");
    assert(result[9], "space");
    assert(result[10], "keyword", "${");
    assert(result[11], "property", "age");
    assert(result[12], "keyword", "}");
    assert(result[13], "space");
    assert(result[14], "word", "old");
    assert(result[15], "space");
    assert(result[16], "word", "and");
    assert(result[17], "space");
    assert(result[18], "word", "lives");
    assert(result[19], "space");
    assert(result[20], "word", "at");
    assert(result[21], "space");
    assert(result[22], "string", '"');
    assert(result[23], "keyword", "${");
    assert(result[24], "property", 'address.street');
    assert(result[25], "keyword", "}");
    assert(result[26], "string", `"`);
})

test ("tokenize - globals with objects", () => {
    const result = tokenize("$globals.date = {title: ${title}}");
    expect(result.length).toBe(12);

    assert(result[0], "property", "$globals.date");
    assert(result[1], "space");
    assert(result[2], "operator", "=");
    assert(result[3], "space");
    assert(result[4], "keyword", "{");
    assert(result[5], "word", "title");
    assert(result[6], "keyword", ":");
    assert(result[7], "space");
    assert(result[8], "keyword", "${");
    assert(result[9], "property", "title");
    assert(result[10], "keyword", "}");
    assert(result[11], "keyword", "}");
})

test ("tokenize - set object with event", () => {
    const result = tokenize("{ x: $event.x, y: $event.y }");
    expect(result.length).toBe(14);

    assert(result[0], "keyword", "{");
    assert(result[1], "space");
    assert(result[2], "word", "x");
    assert(result[3], "keyword", ":");
    assert(result[4], "space");
    assert(result[5], "property", "$event.x");
    assert(result[6], "keyword", ",")
    assert(result[7], "space");
    assert(result[8], "word", "y");
    assert(result[9], "keyword", ":");
    assert(result[10], "space");
    assert(result[11], "property", "$event.y");
    assert(result[12], "space");
    assert(result[13], "keyword", "}");
})

/*


test("sanitizeExp - set object with event", () => {
    const result = sanitizeExp("{ x: $event.x, y: $event.y }");
    expect(result.expression).toBe("{ x: event.x, y: event.y }");
    expect(result.properties[0]).toBe("x");
    expect(result.properties[1]).toBe("y");
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
    expect(result.expression).toBe("!crsbinding.data.globals.isActive");
})

test("sanitize - $context equals expression", () => {
    const result = sanitizeExp("$context.value1 == $context.value2");
    expect(result.expression).toBe("context.value1 == context.value2");
})

test("sanitize - equals expression using '=='", () => {
    const result = sanitizeExp("value1 == value2");
    expect(result.expression).toBe("context.value1 == context.value2");
})

test("sanitize - equals expression using '==='", () => {
    const result = sanitizeExp("value1 === value2");
    expect(result.expression).toBe("context.value1 === context.value2");
})
 */