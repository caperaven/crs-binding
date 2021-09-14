const TokenTypes = Object.freeze({
    WORD    : "word",
    LITERAL : "literal",
    FUNCTION: "function",
    PROPERTY: "property",
    OBJECT  : "object",
    KEYWORD : "keyword",
    OPERATOR: "operator",
    NUMBER  : "number",
    SPACE   : "space",
    STRING  : "string"
})

export function tokenize(exp, isLiteral) {
    const result = [];
    let word = [];
    let i = 0;

    function step(type, value) {
        if (word.length > 0) {
            const value = word.join("");
            pushWord(value);
        }

        result.push({type: type, value: value});
    }

    function pushWord(value) {
        let wordType = TokenTypes.WORD

        if (keywords.indexOf(value) != -1) {
            wordType = TokenTypes.KEYWORD;
        }

        if (isNaN(Number(value)) == false) {
            wordType = TokenTypes.NUMBER;
        }

        result.push({type: wordType, value: value});
        word.length = 0;
    }

    for (i; i < exp.length; i++) {
        const char = exp[i];

        if (char == " ") {
            step(TokenTypes.SPACE, " ");
            continue;
        }

        if (char == "`") {
            step(TokenTypes.LITERAL, "`");
            continue;
        }

        // check for string literal variable markers
        if (char == "$") {
            if (exp[i + 1] == "{") {
                step(TokenTypes.KEYWORD, "${");
                i++;
                continue;
            }
        }

        // check for hardcoded string values
        if (char == "'" || char == '"') {
            const lastIndex = i + exp.length - i;
            let hasLiteral = false;

            // check for end of expression
            if (exp[i + 1] == undefined) {
                step(TokenTypes.STRING, char);
                break;
            }

            let j = i + 1;
            for (j; j < lastIndex; j++) {
                // Once you see the string contains a literal expression, stop the processing of the string
                if (exp[j] == "$" && exp[j + 1] == "{") {
                    hasLiteral = true;
                    break;
                }

                // If you hit the end of string char stop the process and add the string value to the tokens
                if (exp[j] == char) {
                    const value = exp.substring(i, j + 1);
                    step(TokenTypes.STRING, value);
                    break;
                }
            }

            if (hasLiteral == true) {
                step(TokenTypes.STRING, char);
            }
            // if we did copy a string value, move the marker up to the end of the string
            else {
                i = j;
            }

            continue;
        }

        // check for single character key words
        if (keywords.indexOf(char) != -1) {
            step(TokenTypes.KEYWORD, char);
            continue;
        }

        // check for operators
        if (operatorStart.indexOf(char) != -1) {
            for (let j = i; j < i + 4; j++) {
                const charNext = exp[j];
                if (operatorStart.indexOf(charNext) == -1) {
                    const value = exp.substring(i, j);
                    step(TokenTypes.OPERATOR, value);
                    i = j - 1;
                    break;
                }
            }
            continue;
        }

        word.push(char);
    }

    if (word.length > 0) {
        pushWord(word.join(""));
    }

    return postProcessTokens(result, isLiteral);
}

function postProcessTokens(tokens, isLiteral) {
    if (tokens.length == 1 && tokens[0].type == TokenTypes.WORD) {
        tokens[0].type = TokenTypes.PROPERTY;
        return tokens;
    }

    let state = [];
    let isObject = false;

    let i = 0;
    while(tokens[i] != undefined) {
        const token = tokens[i];
        const currentState = state.length == 0 ? "none" : state[state.length - 1];
        const index = token.value.indexOf(".");

        if (token.type == TokenTypes.WORD) {
            // word is inside a ${...} expression so must be a property
            if (currentState == TokenTypes.LITERAL) {
                // if the word starts with "." it's part of a bigger expression after a function call
                if (token.value[0] == "." && tokens[i + 1].value == "(") {
                    token.type = TokenTypes.FUNCTION;
                    i++;
                    continue;
                }

                token.type = TokenTypes.PROPERTY;
            }

            // word contains "." indicating a path expression
            else if (index != -1) {
                if (tokens[i - 1]?.value === ")" && index === 0) {
                    // This is part of a property path on a function call for example ().length
                    token.type = TokenTypes.FUNCTION;
                }
                else {
                    token.type = TokenTypes.PROPERTY;
                }
            }

            // left of operator
            else if (isOperator(tokens[i + 1]) || isOperator(tokens[i + 2])) {
                if (isLiteral !== true && currentState !== TokenTypes.OBJECT) {
                    token.type = TokenTypes.PROPERTY;
                }
            }

            // right of operator
            else if (isLiteral !== true && isOperator(tokens[i - 1]) || isOperator(tokens[i - 2])) {
                if (currentState !== TokenTypes.OBJECT) {
                    token.type = TokenTypes.PROPERTY;
                }
            }

            // the first item in the expression is a function but treat it like a property so that context. is added
            else if (i === 0 && tokens[i + 1]?.value === "(") {
                token.type = TokenTypes.PROPERTY
            }
        }

        // Check if this is part of a function expression and update the property accordingly.
        if (token.type == TokenTypes.KEYWORD && token.value == "(" && (tokens[i - 1] && tokens[i - 1].type == TokenTypes.PROPERTY && tokens[i - 1].value[0] != "$")) {
            const path = tokens[i - 1].value;

            if (path.indexOf(".") == -1) {
                tokens[i - 1].type = TokenTypes.FUNCTION;
            }
            else {
                let dotIndex = path.length -1;

                // get the location of the dot so you can separate the function from the property;
                for (let i = path.length -1 ; i >= 0; i--) {
                    if (path[i] == ".") {
                        dotIndex = i;
                        break;
                    }
                }

                if (dotIndex > 0) {
                    // split the property name from the function name
                    const property = path.substring(0, dotIndex);
                    const fnName = path.substring(dotIndex, path.length);

                    tokens[i - 1].value = property;
                    tokens.splice(i, 0, {type: TokenTypes.FUNCTION, value: fnName});
                    i++;
                }
                else {
                    tokens[i - 1].type = TokenTypes.FUNCTION;
                }
            }
        }

        // manage current state for processing
        if (token.value == "${") {
            state.push(TokenTypes.LITERAL);
        }
        else if (token.value == "{") {
            state.push(TokenTypes.OBJECT);
        }
        else if (token.value == "}") {
            state.pop();
        }

        i++;
    }

    if (tokens[0].type === TokenTypes.FUNCTION) {
        tokens[0].type = TokenTypes.PROPERTY;
    }

    return tokens;
}

function isOperator(token) {
    if (token == null) return false;
    return token.type == TokenTypes.OPERATOR;
}

const operatorStart = ["=", "!", "<", ">", "+", "-", "*", "/", "&", "|", "?", ":"];
const keywords = ["{", "}", "(", ")", ",", "true", "false", "null", "undefined", "[]"];
