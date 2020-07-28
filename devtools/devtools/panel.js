const port = chrome.runtime.connect({name: "crs-binding-panel"});

document.querySelector("#btnRefresh").addEventListener("click", performRefresh);

port.onMessage.addListener(args => {
    if (args.msg.key == "refresh-result") {
        refresh(args.msg.data);
    }
});

function performRefresh() {
    port.postMessage({
        source: "crs-binding-panel",
        key: "refresh"
    });
}

function refresh(data) {
    drawContext(data.contexts);
}

function drawContext(data) {
    const template = document.querySelector("#tplContextItem");
    const contexts = document.querySelector("#contexts");
    contexts.innerHTML = "";

    const fragment = document.createDocumentFragment();
    data.forEach(item => {
        const instance = template.content.cloneNode(true);
        const li = instance.children[0];
        li.innerHTML =
        li.innerHTML
            .split("__id__").join(item.id)
            .split("__type__").join(item.type);
        fragment.appendChild(instance);
    });
    contexts.appendChild(fragment);
}

performRefresh();