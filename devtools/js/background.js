/**
    This script runs in the background and get's its information from the content script.
    The content script pushes to this file when it detects crsbinding active on the page.
 */

const connections = {};

chrome.runtime.onConnect.addListener(port => {
    connections[port.name] = port;

    port.onMessage.addListener(msg => {
        const target = msg.source == "crs-binding-inject" ? "crs-binding-panel" : "crs-binding-inject";
        connections[target] && connections[target].postMessage(msg);
    })
});

// // message from the injected script
// chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
//     window.instances[request.url] = request.hasBinding;
//     console.log("message received");
// });