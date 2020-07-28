const port = chrome.runtime.connect({name: "crs-binding-panel"});

const btnRefresh = document.querySelector("#btnRefresh");
const dataElement = document.querySelector("#secData");
const providersElement = document.querySelector("#secProviders");
const contexts = document.querySelector("#contexts");

let crsData;

btnRefresh.addEventListener("click", performRefreshEvent);
contexts.addEventListener("click", selectContextEvent);
dataElement.addEventListener("click", selectDataEvent);

port.onMessage.addListener(args => {
    if (args.msg.key == "refresh-result") {
        refresh(args.msg.data);
    }
});

function performRefreshEvent() {
    dataElement.setAttribute("hidden", "hidden");
    providersElement.setAttribute("hidden", "hidden");

    port.postMessage({
        source: "crs-binding-panel",
        key: "refresh"
    });
}

function selectContextEvent(event) {
    const dataId = event.target.dataset.id;
    if (dataId == null) return;
    drawData(Number(dataId));
    drawProviders(crsData.providers.filter(item => item.context == dataId));
}

function selectDataEvent(event) {
    if (event.target.nodeName == "LI") {
        const child = event.target.querySelector("ul");

        if (child != null) {
            if (child.classList.contains("collapsed")) {
                child.classList.remove("collapsed");
                event.target.classList.remove("collapsed");
            }
            else {
                child.classList.add("collapsed");
                event.target.classList.add("collapsed");
            }
        }
    }
}

function refresh(data) {
    crsData = data;
    drawContext(crsData.contexts);
}

function drawContext(data) {
    const template = document.querySelector("#tplContextItem");
    contexts.innerHTML = "";

    const fragment = document.createDocumentFragment();
    data.forEach(item => {
        const instance = template.content.cloneNode(true);
        const li = instance.children[0];
        const count = providerCount(item.id);

        li.dataset.id = item.id;
        li.innerHTML =
            li.innerHTML
                .split("__id__").join(item.id)
                .split("__type__").join(item.type)
                .split("__count__").join(count);
        fragment.appendChild(instance);
    });
    contexts.appendChild(fragment);
}

function drawData(id) {
    const data = crsData.data.find(item => item.id === id);
    dataElement.removeAttribute("hidden");
    const container = dataElement.querySelector("ul");
    container.innerHTML = "";

    const template = document.querySelector("#tplDataItem");

    const fragment = document.createDocumentFragment();
    const keys = Object.getOwnPropertyNames(data.value);
    keys.forEach(key => {
        drawDataItem(key, data.value, fragment, template);
    });
    container.appendChild(fragment);
}

function drawDataItem(property, dataItem, fragment, template) {
    const options = getValue(dataItem[property]);

    const instance = template.content.cloneNode(true);
    const li = instance.children[0];
    li.innerHTML =
        li.innerHTML
            .split("__property__").join(property)
            .split("__value__").join(options.value);

    if (options.highlight == false) {
        li.children[2].classList.remove("highlight");
        li.classList.add("parent");
    }
    else {
        li.classList.add("value");
    }

    if (options.type != "value") {
        const childFragment = document.createDocumentFragment();
        const keys = Object.keys(dataItem[property]);
        keys.forEach(key => {
            drawDataItem(key, dataItem[property], childFragment, template);
        });
        const ul = document.createElement("ul");
        ul.appendChild(childFragment);
        li.appendChild(ul);
    }

    fragment.appendChild(instance);
}

function providerCount(id) {
    return crsData.providers.filter(item => item.context == id).length;
}

function drawProviders(providers) {
    providersElement.removeAttribute("hidden");
    const container = providersElement.querySelector("ul");
    container.innerHTML = "";
    const template = document.querySelector("#tplTemplate");

    const fragment = document.createDocumentFragment();

    providers.forEach(provider => {
        const instance = template.content.cloneNode(true);
        const li = instance.children[0];
        li.innerHTML =
            li.innerHTML
                .split("__id__").join(provider.id)
                .split("__name__").join(provider.type)
                .split("__node__").join(provider.nodeName)

        fragment.appendChild(li);
    });

    container.appendChild(fragment);
}

function getValue(item) {
    const result = {
        value: "null",
        highlight: true,
        type: "value"
    };

    if (item == null) {
        result.value = "null";
    }
    else {
        if (Array.isArray(item)) {
            result.value = `[array (${item.length})]`;
            result.highlight = false;
            result.type = "array";
        }
        else {
            result.value = item.toString();
            if (result.value == "[object Object]") {
                result.value = "[object]";
                result.highlight = false;
                result.type = "object";
            }
        }
    }

    return result;
}

performRefreshEvent();