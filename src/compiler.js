import {sanitize} from "./expressions.js";

export function compile(exp) {
    if (crsbinding._expFn.has(exp)) {
        return crsbinding._expFn.get(exp).fn;
    }

    const san = sanitize(exp);
    const src = san.isLiteral === true ? ["return `", san.expression, "`"].join("") : `return ${san.expression}`;
    const fn = new Function("context", src);

    crsbinding._expFn.set(exp, {
        fn: fn,
        count: 1
    });

    return fn;
}