import {tokenize} from "./exp-tokenizer.js";

const sanitizeKeywords = ["false", "true", "null"];

export function sanitizeExp(exp, ctxName = "context", cleanLiterals = false) {
    let isHTML = false;

    if (typeof exp == "string" && exp.indexOf("$html") != -1) {
        isHTML = true;
        exp = exp.split("$html.").join("");
    }

    if (exp == null || exp == "null" || exp == "undefined" || sanitizeKeywords.indexOf(exp.toString()) != -1 || isNaN(exp) == false || exp.trim() == ctxName) {
        return {
            isLiteral: true,
            expression: exp,
            isHTML: isHTML
        }
    }

    const namedExp = ctxName != "context";

    if (namedExp == true && exp == ["${", ctxName, "}"].join("")) {
        return {
            isLiteral: true,
            expression: exp
        }
    }

    const properties = new Set();
    const isLiteral = exp.indexOf("${") != -1;

    const tokens = tokenize(exp);
    const expression = [];

    for (let token of tokens) {
        if (token.type == "property") {
            if (token.value.indexOf("$globals") != -1) {
                expression.push(token.value.replace("$globals", "crsbinding.data.globals"));
            }
            else if (token.value.indexOf("$event") != -1) {
                expression.push(token.value.replace("$event", "event"));
            }
            else if (token.value.indexOf("$context") != -1) {
                expression.push(token.value.replace("$context", "context"));
            }
            else if (token.value.indexOf("$data") != -1) {
                expression.push(token.value.replace("$data", "crsbinding.data.getValue"));
            }
            else if (token.value.indexOf("$parent") != -1) {
                expression.push(token.value.replace("$parent", "parent"));
            }
            else if (token.value.indexOf(`${ctxName}.`) != -1) {
                expression.push(token.value);
            }
            else {
                expression.push(`${ctxName}.${token.value}`);
            }

            addProperty(properties, token.value, ctxName);
        }
        else {
            expression.push(token.value);
        }
    }

    return {
        isLiteral: isLiteral,
        isHTML: isHTML,
        expression: expression.join(""),
        properties: Array.from(properties)
    }
}

const fnNames = [".trim", ".toLowerCase", "toUpperCase"];
const ignoreProperties = ["$data", "$event"];

function addProperty(set, property, ctxName) {
    if (property.length == 0) return;

    for (let ignore of ignoreProperties) {
        if (property.indexOf(ignore) != -1) return;
    }

    let propertyValue = property;

    const ctxPrefix = `${ctxName}.`;
    if (propertyValue.indexOf(ctxPrefix) == 0) {
        propertyValue = propertyValue.replace(ctxPrefix, "");
    }

    for (let fnName of fnNames) {
        if (propertyValue.indexOf(fnName) != -1) {
            propertyValue = propertyValue.split(fnName).join("");
        }
    }

    set.add(propertyValue);
}