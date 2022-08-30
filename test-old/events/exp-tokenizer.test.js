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

test("tokenize - tripple =", () => {
    const result = tokenize("value1 === value2");
    expect(result.length).toBe(5);

    assert(result[0], "property", "value1");
    assert(result[1], "space");
    assert(result[2], "operator", "===");
    assert(result[1], "space");
    assert(result[4], "property", "value2");
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
    expect(result.length).toBe(8);

    assert(result[0], "property", "property1");
    assert(result[1], "function", ".toUpper");
    assert(result[2], "keyword", "(");
    assert(result[3], "keyword", ")");
    assert(result[4], "space");
    assert(result[5], "operator", "==");
    assert(result[6], "space");
    assert(result[7], "string", "'A'");
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
    expect(result.length).toBe(21);

    assert(result[0], "keyword", "${");
    assert(result[1], "property", "firstName");
    assert(result[2], "function", ".trim");
    assert(result[3], "keyword", "(");
    assert(result[4], "keyword", ")");
    assert(result[5], "function", ".toLowerCase");
    assert(result[6], "keyword", "(");
    assert(result[7], "keyword", ")");
    assert(result[8], "keyword", "}");
    assert(result[9], "space");
    assert(result[10], "operator", ">");
    assert(result[11], "space");
    assert(result[12], "keyword", "${");
    assert(result[13], "property", "lastName");
    assert(result[14], "function", ".trim");
    assert(result[15], "keyword", "(");
    assert(result[16], "keyword", ")");
    assert(result[17], "function", ".toLowerCase");
    assert(result[18], "keyword", "(");
    assert(result[19], "keyword", ")");
    assert(result[20], "keyword", "}");
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
    assert(result[6], "operator", "?");
    assert(result[7], "space");
    assert(result[8], "keyword", "true");
    assert(result[9], "space");
    assert(result[10], "operator", ":");
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
    assert(result[6], "operator", ":");
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
    assert(result[3], "operator", ":");
    assert(result[4], "space");
    assert(result[5], "property", "$event.x");
    assert(result[6], "keyword", ",")
    assert(result[7], "space");
    assert(result[8], "word", "y");
    assert(result[9], "operator", ":");
    assert(result[10], "space");
    assert(result[11], "property", "$event.y");
    assert(result[12], "space");
    assert(result[13], "keyword", "}");
})

test("sanitizeExp - toggle boolean", () => {
    const result = tokenize("$context.isOpen = !$context.isOpen");
    expect(result.length).toBe(6);

    assert(result[0], "property", "$context.isOpen");
    assert(result[1], "space");
    assert(result[2], "operator", "=");
    assert(result[3], "space");
    assert(result[4], "operator", "!");
    assert(result[5], "property", "$context.isOpen");
});

test("sanitize", () => {
    const result = tokenize("selectedObj = $data($event.target.dataset.id)");
    expect(result.length).toBe(8);

    assert(result[0], "property", "selectedObj");
    assert(result[1], "space");
    assert(result[2], "operator", "=");
    assert(result[3], "space");
    assert(result[4], "property", "$data");
    assert(result[5], "keyword", "(");
    assert(result[6], "property", "$event.target.dataset.id");
    assert(result[7], "keyword", ")");
})

test("sanitize - not expressions", () => {
    const result = tokenize("!isActive && !isOn");
    expect(result.length).toBe(7);

    assert(result[0], "operator", "!");
    assert(result[1], "property", "isActive");
    assert(result[2], "space");
    assert(result[3], "operator", "&&");
    assert(result[4], "space");
    assert(result[5], "operator", "!");
    assert(result[6], "property", "isOn");
})

test("sanitize - parameters", () => {
    const result = tokenize("(model.property.isValid('abc', 10) == true)");
    expect(result.length).toBe(14);

    assert(result[0], "keyword", "(");
    assert(result[1], "property", "model.property");
    assert(result[2], "function", ".isValid");
    assert(result[3], "keyword", "(");
    assert(result[4], "string", "'abc'");
    assert(result[5], "keyword", ",");
    assert(result[6], "space");
    assert(result[7], "number", "10");
    assert(result[8], "keyword", ")");
    assert(result[9], "space");
    assert(result[10], "operator", "==");
    assert(result[11], "space");
    assert(result[12], "keyword", "true");
    assert(result[13], "keyword", ")");
})

test("sanitize - literal with function", () => {
    const result = tokenize("`rotate(${angle}deg)`");
    expect(result.length).toBe(9);

    assert(result[0], "literal", "`");
    assert(result[1], "word", "rotate");
    assert(result[2], "keyword", "(");
    assert(result[3], "keyword", "${");
    assert(result[4], "property", "angle");
    assert(result[5], "keyword", "}");
    assert(result[6], "word", "deg");
    assert(result[7], "keyword", ")");
    assert(result[8], "literal", "`");
})

test("sanitize - literal with math expression", () => {
    const result = tokenize("`${(rect.x / 2)}px ${(rect.y / 2)}px`");
    expect(result.length).toBe(23);

    assert(result[0], "literal", "`");
    assert(result[1], "keyword", "${");
    assert(result[2], "keyword", "(");
    assert(result[3], "property", "rect.x");
    assert(result[4], "space");
    assert(result[5], "operator", "/");
    assert(result[6], "space");
    assert(result[7], "number", "2");
    assert(result[8], "keyword", ")");
    assert(result[9], "keyword", "}");
    assert(result[10], "word", "px");
    assert(result[11], "space");
    assert(result[12], "keyword", "${");
    assert(result[13], "keyword", "(");
    assert(result[14], "property", "rect.y");
    assert(result[15], "space");
    assert(result[16], "operator", "/");
    assert(result[17], "space");
    assert(result[18], "number", "2");
    assert(result[19], "keyword", ")");
    assert(result[20], "keyword", "}");
    assert(result[21], "word", "px");
    assert(result[22], "literal", "`");
})

test("sanitize - simple function", () => {
    const result = tokenize("property = myFunction()");
    expect(result.length).toBe(7);

    assert(result[0], "property", "property");
    assert(result[1], "space");
    assert(result[2], "operator", "=");
    assert(result[3], "space");
    assert(result[4], "function", "myFunction");
    assert(result[5], "keyword", "(");
    assert(result[6], "keyword", ")");
})

test("sanitize - simple function", () => {
    const result = tokenize("property = object.myFunction()");
    expect(result.length).toBe(8);

    assert(result[0], "property", "property");
    assert(result[1], "space");
    assert(result[2], "operator", "=");
    assert(result[3], "space");
    assert(result[4], "property", "object");
    assert(result[5], "function", ".myFunction");
    assert(result[6], "keyword", "(");
    assert(result[7], "keyword", ")");
})

test("sanitize - chained function calls", () => {
    const result = tokenize("property = string.trim().toLowerCase()");
    expect(result.length).toBe(11);

    assert(result[0], "property", "property");
    assert(result[1], "space");
    assert(result[2], "operator", "=");
    assert(result[3], "space");
    assert(result[4], "property", "string");
    assert(result[5], "function", ".trim");
    assert(result[6], "keyword", "(");
    assert(result[7], "keyword", ")");
    assert(result[8], "function", ".toLowerCase");
    assert(result[9], "keyword", "(");
    assert(result[10], "keyword", ")");
})