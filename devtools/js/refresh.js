function getData() {
    if (window.crsbinding == null) return null;
    return {
        contexts: getContextValues(),
        data: getDataValues(),
        providers: getProviders()
    };
}

function getContextValues() {
    const result = [{
        id: 0,
        type: "Globals"
    }];

    function process(value, key) {
        let type = value.constructor.name;

        if (value instanceof HTMLElement) {
            type = `${type} (Element)`
        }

        result.push({
            id: key,
            type: type
        })
    }

    crsbinding.data.details.context.forEach(process);

    return result;
}

function getDataValues() {
    const result = [];

    function process(value, key) {
        result.push({
            id: key,
            value: value.data
        })
    }

    crsbinding.data.details.data.forEach(process);

    return result;
}

function getProviders() {
    const result = [];

    function process(value, key) {
        let exp = value._value;

        if (exp == null) {
            exp = value._expObj ? value._expObj.parameters.expression : "";
        }

        result.push({
            id: key,
            context: value._context,
            type: value.constructor.name,
            nodeName: value._element.nodeName,
            expression: exp
        });
    }

    crsbinding.providerManager.items.forEach(process);

    return result;
}

window.postMessage({
    key: "refresh-result",
    data: getData()
}, "*");