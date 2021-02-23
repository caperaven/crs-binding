export function tokenize(exp) {
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
        let wordType = "word"

        if (keywords.indexOf(value) != -1) {
            wordType = "keyword";
        }

        if (isNaN(Number(value)) == false) {
            wordType = "number";
        }

        result.push({type: wordType, value: value});
        word.length = 0;
    }

    for (i; i < exp.length; i++) {
        const char = exp[i];

        if (char == " ") {
            step("space", " ");
            continue;
        }

        if (char == "`") {
            step("literal", "`");
            continue;
        }

        // check for string literal variable markers
        if (char == "$") {
            if (exp[i + 1] == "{") {
                step("keyword", "${");
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
                step("string", char);
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
                    step("string", value);
                    break;
                }
            }

            if (hasLiteral == true) {
                step("string", char);
            }
            // if we did copy a string value, move the marker up to the end of the string
            else {
                i = j;
            }

            continue;
        }

        // check for single character key words
        if (keywords.indexOf(char) != -1) {
            step("keyword", char);
            continue;
        }

        // check for operators
        if (operatorStart.indexOf(char) != -1) {
            for (let j = i; j < i + 4; j++) {
                const charNext = exp[j];
                if (operatorStart.indexOf(charNext) == -1) {
                    const value = exp.substring(i, j);
                    step("operator", value);
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

    return postProcessTokens(result);
}

function postProcessTokens(tokens) {
    if (tokens.length == 1 && tokens[0].type == "word") {
        tokens[0].type = "property";
        return tokens;
    }

    let state = [];

    let i = 0;
    while(tokens[i] != undefined) {
        const token = tokens[i];
        const currentState = state.length == 0 ? "none" : state[state.length - 1];

        if (token.type == "word") {
            // word is inside a ${...} expression so must be a property
            if (currentState == "literal") {
                // if the word starts with "." it's part of a bigger expression after a function call
                if (token.value[0] == "." && tokens[i + 1].value == "(") {
                    token.type = "function";
                    i++;
                    continue;
                }

                token.type = "property";
            }

            // word contains "." indicating a path expression
            else if (token.value.indexOf(".") != -1) {
                token.type = "property";
            }

            // left of operator
            else if (isOperator(tokens[i + 1]) || isOperator(tokens[i + 2])) {
                token.type = "property";
            }

            // right of operator
            else if (isOperator(tokens[i - 1]) || isOperator(tokens[i - 2])) {
                token.type = "property";
            }
        }

        // Check if this is part of a function expression and update the property accordingly.
        if (token.type == "keyword" && token.value == "(" && (tokens[i - 1] && tokens[i - 1].type == "property" && tokens[i - 1].value[0] != "$")) {
            const path = tokens[i - 1].value;

            if (path.indexOf(".") == -1) {
                tokens[i - 1].type = "function";
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
                    tokens.splice(i, 0, {type: "function", value: fnName});
                    i++;
                }
                else {
                    tokens[i - 1].type = "function";
                }
            }
        }

        // manage current state for processing
        if (token.value == "${") {
            state.push("literal");
        }
        else if (token.value == "{") {
            state.push("object");
        }
        else if (token.value == "}") {
            state.pop();
        }

        i++;
    }

    return tokens;
}

function isOperator(token) {
    if (token == null) return false;
    return token.type == "operator";
}

const operatorStart = ["=", "!", "<", ">", "+", "-", "*", "/", "&", "|"];
const keywords = ["{", "}", "(", ")", "?", ":", ",", "true", "false", "null", "undefined"];
