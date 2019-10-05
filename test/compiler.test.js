import {compileExp, releaseExp} from "../src/events/compiler.js";

beforeAll(() => {
    global.crsbinding = {
        _expFn: new Map()
    }
});

test("releaseExp - count down", () => {
    const exp = "property1 == 'a'";
    compileExp(exp);
    compileExp(exp);

    expect(global.crsbinding._expFn.get(exp).count).toEqual(2);

    releaseExp(exp);
    expect(global.crsbinding._expFn.get("property1 == 'a'").count).toEqual(1);
    releaseExp(exp);
    expect(global.crsbinding._expFn.get("property1 == 'a'")).toBeUndefined();
});

test("compileExp - get value", () => {
    const exp = "property1 == 'a'";
    const cmp = compileExp(exp);

    expect(cmp.function({
        property1: 'a'
    })).toBe(true);

    expect(cmp.function({
        property1: 'b'
    })).toBe(false);
});

test ('compileExp - expression', () => {
    const cmp = compileExp("${name} is ${age} years old");
    expect(cmp.function({
        name: "John",
        age: 10
    })).toBe("John is 10 years old");
});

test ('compileExp - calculate', () => {
   const cmp = compileExp("${10 + age}");
   expect(cmp.function({age: 10})).toBe("20");
});

test('compileExp - get value', () => {
   const cmp = compileExp("name");
   expect(cmp.function({name: "test"})).toBe("test");
});

test('compileExp - expression with function', () => {
    const cmp = compileExp("${name.toUpperCase()}");
    expect(cmp.function({name: "test"})).toBe("TEST");
});