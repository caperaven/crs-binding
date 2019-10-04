import {sanitizeExp} from "./expressions.js";

export function compileExp(exp) {
    if (crsbinding._expFn.has(exp)) {
        const x = crsbinding._expFn.get(exp);
        x.count += 1;
        return x.fn;
    }

    const san = sanitizeExp(exp);
    const src = san.isLiteral === true ? ["return `", san.expression, "`"].join("") : `return ${san.expression}`;
    const fn = new Function("context", src);

    crsbinding._expFn.set(exp, {
        fn: fn,
        count: 1
    });

    return fn;
}

export function releaseExp(exp) {
    if (crsbinding._expFn.has(exp)) {
        const x = crsbinding._expFn.get(exp);
        x.count -= 1;

        if (x.count == 0) {
            x.fn = null;
            crsbinding._expFn.delete(exp);
        }
    }
}
