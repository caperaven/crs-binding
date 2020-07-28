function getData() {
    if (window.crsbinding == null) return null;
    return {
        contexts: getContext()
    };
}

function getContext() {
    const result = [];

    function process(value, key) {
        result.push({
            id: key,
            type: value.constructor.name
        })
    }

    crsbinding.data.details.context.forEach(process);

    return result;
}

window.postMessage({
    key: "refresh-result",
    data: getData()
}, "*");