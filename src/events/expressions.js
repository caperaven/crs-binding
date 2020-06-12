/**
 * Contextualize a expression and extract the properties defined in the expression
 * @param exp
 * @returns {{expression: *, properties: *}}
 */
export function sanitizeExp(exp, ctxName = "context", cleanLiterals = false) {
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
                        if (ignoreTokens.indexOf(path[0]) == -1 && token != ":") {
                            indexes.push(i - path.length);
                        }
                        properties.push(extractProperty(`${path.join("")}`));
                    }
                }

                path.length = 0;
            }

            continue;
        }

        if (oldToken == "$" && reservedTokens.indexOf(token) != -1) {
            path.push(`$${token}`);
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

    if (indexes.length == 0 && exp.indexOf(".") != -1 && exp.indexOf("$globals") == -1 && exp.indexOf("$context") == -1 && exp.trim()[0] != "{") {
        indexes.push(0);
    }

    for (let i = 0; i < indexes.length; i++) {
        tokens.splice(i + indexes[i], 0, prefix);
    }

    if (cleanLiterals == true) {
        let i = 0;
        while (i < tokens.length) {
            if (tokens[i] == "$" && tokens[i+1] == "{") {
                tokens.splice(i, 2);
                removeNextToken(tokens, i, "}");
            }
            i++;
        }
    }

    return {
        isLiteral: isLiteral,
        expression: tokens.join("")
            .split("$globals").join("crsbinding.data.globals")
            .split("$event").join("event")
            .split("$context").join("context"),
        properties: properties
    }
}

function removeNextToken(collection, startIndex, token) {
    for (let i = startIndex; i < collection.length; i++) {
        if (collection[i] == token) {
            collection.splice(i, 1);
            break;
        }
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

const reserved = ["true", "false", "-", "+", "=", "<", ">", "(", ")","{", "}", "/",  "&", "|", "=", "!", "'", "`", '"', " ", "$", ".", ",", "?", ":", "null", "undefined", "new", "Math"];
const ignore = [".", "(", ")", ","];
const reservedTokens = ["globals", "event", "context"];
const ignoreTokens = ["$globals", "$event", "$context"];
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