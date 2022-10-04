export function getConverterParts(exp) {
    const result = {
        path: exp
    };
    parseConverter(result);
    parseParameter(result);
    return result;
}

function parseConverter(result) {
    const parts = subDivide(result.path, ":");
    result.path = parts[0];
    result.converter = parts[1];
}

function parseParameter(result) {
    const index1 = result.converter.indexOf("(");
    const index2 = result.converter.indexOf(")");

    const parameter = result.converter.substring(index1 + 1, index2).split("'").join('"');
    const converter = result.converter.substring(0, index1);
    const postExp = result.converter.substring(index2 + 1, result.converter.length);

    result.converter = converter;
    result.parameter = parameter.length == 0 ? null : JSON.parse(parameter);
    result.postExp = postExp;
}

function subDivide(str, sep) {
    const index = str.indexOf(sep);
    const result = [];

    result.push(str.substring(0, index));
    result.push(str.substring(index + 1, str.length));
    return result;
}