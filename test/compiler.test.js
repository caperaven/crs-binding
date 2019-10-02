import {compile} from "./../src/compiler.js";

test("compile - get value", () => {
    const fn = compile("property1 == 'a'");
    expect(fn({
        property1: 'a'
    })).toBe(true);

    expect(fn({
        property1: 'b'
    })).toBe(false);
});

test ('compile - expression', () => {
    const fn = compile("${name} is ${age} years old");
    expect(fn({
        name: "John",
        age: 10
    })).toBe("John is 10 years old");
});

test ('compile - calculate', () => {
   const fn = compile("${10 + age}");
   expect(fn({age: 10})).toBe("20");
});