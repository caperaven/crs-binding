import {compileExp, releaseExp} from "../../src/events/compiler.js";
import {crsbindingMock} from "../crsbinding.mock.js";

beforeAll(async () => {
    const bindingModule = await import("./../crsbinding.mock.js");
    global.crsbinding = bindingModule.crsbinding;
});

test("releaseExp - count down", () => {
    const exp = "property1 == 'a'";
    const expResult1 = compileExp(exp);
    const expResult2 = compileExp(exp);
    const checkExp = expResult1.parameters.expression;

    expect(crsbinding._expFn.get(checkExp).count).toEqual(2);

    releaseExp(expResult1);
    expect(crsbinding._expFn.get(checkExp).count).toEqual(1);
    releaseExp(expResult2);
    expect(crsbinding._expFn.get(checkExp)).toBeUndefined();
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