function getData() {
    if (window.crsbinding == null) return null;
    return {
        contexts: getContextValues(),
        data: getDataValues()
    };
}

function getContextValues() {
    const result = [{
        id: 0,
        type: "Globals"
    }];

    function process(value, key) {
        result.push({
            id: key,
            type: value.constructor.name
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

window.postMessage({
    key: "refresh-result",
    data: getData()
}, "*");