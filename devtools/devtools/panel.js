const port = chrome.runtime.connect({name: "crs-binding-panel"});

const btnRefresh = document.querySelector("#btnRefresh");
const dataElement = document.querySelector("#data");
const triggersElement = document.querySelector("#triggers");
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

performRefreshEvent();