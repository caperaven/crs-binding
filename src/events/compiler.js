export function compileExp(exp, parameters = [], sanitize = true) {
    if (crsbinding._expFn.has(exp)) {
        const x = crsbinding._expFn.get(exp);
        x.count += 1;
        return x;
    }

    let src = exp;
    let san;

    if (sanitize == true) {
        san = crsbinding.sanitizeExp(exp);
        src = san.isLiteral === true ? ["return `", san.expression, "`"].join("") : `return ${san.expression}`;
    }
    else {
        san = {
            expression: exp
        }
    }

    const fn = new Function("context", ...parameters, src);

    const result = {
        function: fn,
        parameters: san,
        count: 1
    };

    crsbinding._expFn.set(san.expression, result);

    return result;
}

export function releaseExp(exp) {
    const key = exp.parameters.expression;
    if (crsbinding._expFn.has(key)) {
        const x = crsbinding._expFn.get(key);
        x.count -= 1;

        if (x.count == 0) {
            x.function = null;
            x.parameters = null;
            crsbinding._expFn.delete(key);
        }
    }
}
