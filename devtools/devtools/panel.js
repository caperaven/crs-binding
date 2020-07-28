const port = chrome.runtime.connect({name: "crs-binding-panel"});

port.onMessage.addListener(msg => {
    document.write(msg.source);
});

port.postMessage({
    source: "crs-binding-panel",
    key: "get-data"
});