/**
 * Contextualize a expression and extract the properties defined in the expression
 * @param exp
 * @returns {{expression: *, properties: *}}
 */
export function sanitizeExp(exp) {
    const prefix = "context.";
    const tokens = tokenize(exp);

    if (tokens.length == 1) {
        return {
            isLiteral: false,
            expression: `${prefix}${exp}`,
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
                    indexes.push(i - path.length);
                    properties.push(extractProperty(`${path.join("")}`));
                }

                path.length = 0;
            }

            continue;
        }

        path.push(token);
        oldToken = token;
    }

    if (indexes.length == 0 && exp.indexOf(".") != -1) {
        indexes.push(0);
    }

    for (let i = 0; i < indexes.length; i++) {
        tokens.splice(i + indexes[i], 0, prefix);
    }

    return {
        isLiteral: isLiteral,
        expression: tokens.join(""),
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

const reserved = ["true", "false", "-", "+", "=", "<", ">", "(", ")","{", "}", "/",  "&", "|", "=", "!", "'", "`", '"', " ", "$", ".", ",", "?", ":"];
const ignore = [".", "(", ")", ","];
const quotes = ["'", '"', "`"];
const stdQuotes = ["'", '"'];

/**
 * Break the expression into expression tokens
 * @param exp
 * @returns {[]}
 */
function tokenize(exp) {
    let tokens = [];
    let word = [];

    let isString = false;
    for (let char of exp) {
        if (isString == true) {
            if (stdQuotes.indexOf(char) == -1) {
                word.push(char);
            }
            else {
                isString = pushToken(tokens, word, char);
            }
        }
        else if (reserved.indexOf(char) != -1) {
            isString = pushToken(tokens, word, char);
        }
        else {
            word.push(char);
        }
        isString = isString || stdQuotes.indexOf(char) != -1;
    }

    if (word.length > 0) {
        tokens.push(word.join(""));
    }

    return tokens;
}

function pushToken(tokens, word, char) {
    if (word.length > 0) {
        tokens.push(word.join(""));
        word.length = 0;
    }

    tokens.push(char);
    return false;
}