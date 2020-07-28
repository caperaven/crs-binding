const port = chrome.runtime.connect({name: "crs-binding-panel"});

const btnRefresh = document.querySelector("#btnRefresh");
const dataElement = document.querySelector("#secData");
const triggersElement = document.querySelector("#secTriggers");
const contexts = document.querySelector("#contexts");

let crsData;

btnRefresh.addEventListener("click", performRefreshEvent);
contexts.addEventListener("click", selectContextEvent);

port.onMessage.addListener(args => {
    if (args.msg.key == "refresh-result") {
        refresh(args.msg.data);
    }
});

function performRefreshEvent() {
    dataElement.setAttribute("hidden", "hidden");
    triggersElement.setAttribute("hidden", "hidden");

    port.postMessage({
        source: "crs-binding-panel",
        key: "refresh"
    });
}

function selectContextEvent(event) {
    const dataId = event.target.dataset.id;
    if (dataId == null) return;
    drawData(Number(dataId));
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
        li.dataset.id = item.id;
        li.innerHTML =
            li.innerHTML
                .split("__id__").join(item.id)
                .split("__type__").join(item.type);
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
        let value;
        let highlight = true;

        if (data.value[key] == null) {
            value = "null";
        }
        else {
            if (Array.isArray(data.value[key])) {
                value = `[array (${data.value[key].length})]`;
                highlight = false;
            }
            else {
                value = data.value[key].toString();
                if (value == "[object Object]") {
                    value = "[object]";
                    highlight = false;
                }
            }
        }

        const instance = template.content.cloneNode(true);
        const li = instance.children[0];
        li.innerHTML =
            li.innerHTML
                .split("__property__").join(key)
                .split("__value__").join(value);

        if (highlight == false) {
            li.children[2].classList.remove("highlight");
        }
        else {
            li.classList.add("value");
        }

        fragment.appendChild(instance);
    });
    container.appendChild(fragment);
}

performRefreshEvent();