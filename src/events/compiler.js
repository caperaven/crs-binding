const AsyncFunction = Object.getPrototypeOf(async function(){}).constructor;

export function compileExp(exp, parameters, options) {
    parameters = parameters || [];
    let sanitize = true;
    let async = false;
    let ctxName = "context";

    if (options != null) {
        if (options.sanitize != null) sanitize = options.sanitize;
        if (options.async != null) async = options.async;
        if (options.ctxName != null) ctxName = options.ctxName;
    }

    if (crsbinding._expFn.has(exp)) {
        const x = crsbinding._expFn.get(exp);
        x.count += 1;
        return x;
    }

    let src = exp;
    let san;

    if (sanitize == true) {
        san = crsbinding.expression.sanitize(exp, ctxName);

        if (crsbinding._expFn.has(san.expression)) {
            const x = crsbinding._expFn.get(san.expression);
            x.count += 1;
            return x;
        }

        src = san.isLiteral === true ? ["return `", san.expression, "`"].join("") : `return ${san.expression}`;

        const parts = san.expression.split(".");
        if (parts.length > 2) {
            src = `try { ${src} } catch(error) { return null }`;
        }
    }
    else {
        san = {
            expression: exp
        }
    }

    const fn = async == true ? new AsyncFunction(ctxName, ...parameters, src) : new Function(ctxName, ...parameters, src);

    const result = {
        function: fn,
        parameters: san,
        count: 1
    };

    crsbinding._expFn.set(san.expression, result);

    return result;
}

export function releaseExp(exp) {
    if (exp == null || typeof exp != "object") return;
    
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
