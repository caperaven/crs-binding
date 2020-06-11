/**
 * Contextualize a expression and extract the properties defined in the expression
 * @param exp
 * @returns {{expression: *, properties: *}}
 */
export function sanitizeExp(exp, ctxName = "context") {
    const namedExp = ctxName != "context";
    const prefix = `${ctxName}.`;
    const tokens = tokenize(exp, namedExp ? ctxName : null);

    if (tokens.length == 1) {
        return {
            isLiteral: false,
            expression: `${prefix}${tokens[0]}`,
            properties: [exp]
        }
    }

    const properties = [];
    const isLiteral = exp.indexOf("${") != -1;

    let oldToken = null;
    let path = [];
    let indexes = [];

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];

        if (quotes.indexOf(oldToken) != -1 || (reserved.indexOf(token) != -1 && ignore.indexOf(token) == -1))
        {
            oldToken = token;

            if (path.length > 0) {
                if (isLiteral == false || oldToken == "}") {
                    if (isNaN(path)) {
                        if (path[0] != "$globals") {
                            indexes.push(i - path.length);
                        }
                        properties.push(extractProperty(`${path.join("")}`));
                    }
                }

                path.length = 0;
            }

            continue;
        }

        if (oldToken == "$" && token == "globals") {
            path.push("$globals");
        }
        else {
            path.push(token);
        }

        oldToken = token;
    }

    if (namedExp && path.length > 0) {
        if (isLiteral == false || oldToken == "}") {
            if (isNaN(path)) {
                indexes.push(tokens.length - 1);
                properties.push(extractProperty(`${path.join("")}`));
            }
        }
    }

    if (indexes.length == 0 && exp.indexOf(".") != -1 && exp.indexOf("$globals") == -1) {
        indexes.push(0);
    }

    for (let i = 0; i < indexes.length; i++) {
        tokens.splice(i + indexes[i], 0, prefix);
    }

    return {
        isLiteral: isLiteral,
        expression: tokens.join("").split("$globals").join("crsbinding.data.globals"),
        properties: properties
    }
}

/**
 * Extract the property path up to where a function is being called.
 * @param property {string}
 * @returns {string|*}
 */
function extractProperty(property) {
    if (property.indexOf("(") == -1) return property;
    const result = [];

    for (let p of property.split(".")) {
        if (p.indexOf("(") != -1) {
            break;
        }
        result.push(p);
    }

    return result.join(".");
}

const reserved = ["true", "false", "-", "+", "=", "<", ">", "(", ")","{", "}", "/",  "&", "|", "=", "!", "'", "`", '"', " ", "$", ".", ",", "?", ":", "null", "undefined"];
const ignore = [".", "(", ")", ","];
const quotes = ["'", '"', "`"];
const stdQuotes = ["'", '"'];

/**
 * Break the expression into expression tokens
 * @param exp
 * @returns {[]}
 */
function tokenize(exp, ctxName) {
    let tokens = [];
    let word = [];

    let isString = false;
    for (let i = 0; i < exp.length; i++) {
        const char = exp[i];

        if (isString == true && char == "$" && exp[i + 1] == "{") {
            isString = false;
        }

        if (isString == true) {
            if (stdQuotes.indexOf(char) == -1) {
                word.push(char);
            }
            else {
                pushToken(tokens, word, char);
                isString = false;
            }
        }
        else if (reserved.indexOf(char) != -1) {
            pushToken(tokens, word, char);
            if (stdQuotes.indexOf(char) != -1) {
                isString = true;
            }
        }
        else {
            word.push(char);
        }
    }

    if (word.length > 0) {
        tokens.push(word.join(""));
    }

    if (ctxName != null) {
        tokens = removeNamedCtx(tokens, ctxName);
    }

    return tokens;
}

function removeNamedCtx(collection, ctxName) {
    const index = collection.indexOf(ctxName);
    if (index == -1) return collection;

    if (collection[index + 1] == ".") {
        collection.splice(index, 2);
        if (collection.indexOf(ctxName) != -1) {
            removeNamedCtx(collection, ctxName)
        };
    }

    return collection;
}

function pushToken(tokens, word, char) {
    if (word.length > 0) {
        tokens.push(word.join(""));
        word.length = 0;
    }

    tokens.push(char);
    return false;
}