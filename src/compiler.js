import {sanitize} from "./expressions.js";

export function compile(exp) {
    const san = sanitize(exp);
    const src = san.isLiteral === true ? ["return `", san.expression, "`"].join("") : `return ${san.expression}`;
    return new Function("context", src);
}