export async function ifFunction(exp) {
    const code = [];
    exp = await crsbinding.expression.sanitize(exp).expression.replaceAll("context.[", "[");

    if (exp.indexOf("?") == -1) {
        return new Function("context", `return ${exp}`);
    }

    const parts = exp.split("?").map(item => item.trim());
    const left = parts[0];
    const right = parts[1];
    const rightParts = right.split(":");

    code.push(`if (${left}) {`);
    code.push(`    return ${rightParts[0].trim()};`);
    code.push('}');

    if (rightParts.length > 1) {
        code.push("else {");
        code.push(`    return ${rightParts[1].trim()};`);
        code.push("}");
    }

    return new Function("context", code.join("\n"));
}

export async function caseFunction(exp) {
    const code = [];
    exp = await crsbinding.expression.sanitize(exp).expression;

    const parts = exp.split(",");

    for (let part of parts) {
        const expParts = part.split(":").map(item => item.trim());

        if (expParts[0] == "context.default") {
            code.push(`return ${expParts[1]};`)
        }
        else {
            code.push(`if (${expParts[0]}) {`)
            code.push(`    return ${expParts[1]};`)
            code.push('}')
        }
    }

    return new Function("context", code.join("\n"));
}