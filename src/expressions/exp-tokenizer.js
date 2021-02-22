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
            const lastIndex = i + 1 + exp.length - i;
            let j = i + 1;
            for (j; j < lastIndex; j++) {
                if (exp[j] == char) {
                    const value = exp.substring(i, j + 1);
                    step("string", value);
                    break;
                }
            }
            i = j;
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

    let state = null;

    for (let i = 0; i < tokens.length; i++) {
        const token = tokens[i];
        if (token.type == "word") {
            // word is inside a ${...} expression so must be a property
            if (state == "literal") {
                // if the word starts with "." it's part of a bigger expression after a function call
                if (token.value[0] == ".") {
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

        // manage current state for processing
        if (token.type == "keyword" && "${") {
            state = "literal";
        }

        if (state == "literal" && token.value == "}") {
            state = null;
        }
    }

    return tokens;
}

function isOperator(token) {
    if (token == null) return false;
    return token.type == "operator";
}

const operatorStart = ["=", "!", "<", ">", "+", "-", "*", "/", "&", "|"];
const keywords = ["{", "}", "(", ")", "?", ":", "true", "false", "null", "undefined"];
