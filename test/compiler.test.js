import {compileExp, releaseExp} from "./../src/compiler.js";

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
    const fn = compileExp(exp);

    expect(fn({
        property1: 'a'
    })).toBe(true);

    expect(fn({
        property1: 'b'
    })).toBe(false);
});

test ('compileExp - expression', () => {
    const fn = compileExp("${name} is ${age} years old");
    expect(fn({
        name: "John",
        age: 10
    })).toBe("John is 10 years old");
});

test ('compileExp - calculate', () => {
   const fn = compileExp("${10 + age}");
   expect(fn({age: 10})).toBe("20");
});

test('compileExp - get value', () => {
   const fn = compileExp("name");
   expect(fn({name: "test"})).toBe("test");
});

test('compileExp - expression with function', () => {
    const fn = compileExp("${name.toUpperCase()}");
    expect(fn({name: "test"})).toBe("TEST");
});