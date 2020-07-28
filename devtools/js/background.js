/**
    This script runs in the background and get's its information from the content script.
    The content script pushes to this file when it detects crsbinding active on the page.
 */

const connections = {};

chrome.runtime.onConnect.addListener(port => {
    connections[port.name] = port;

    port.onMessage.addListener(msg => {
        console.log(msg);

        const target = msg.source == "crs-binding-inject" ? "crs-binding-panel" : "crs-binding-inject";
        connections[target] && connections[target].postMessage(msg);
    })
});