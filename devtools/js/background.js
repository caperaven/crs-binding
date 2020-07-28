/**
    This script runs in the background and get's its information from the content script.
    The content script pushes to this file when it detects crsbinding active on the page.
 */

const instances = {};
const connections = {};

// message from the injected script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    instances[request.url] = request.hasBinding;
});

// messages from the panel
chrome.runtime.onConnect.addListener(port => {
    extensionListener = (message, sender, sendResponse) => {
        if (message.name == "init") {
            connections[message.tabId] = port;
        }
        console.log(connections);
    };

    // Listen to messages sent from the DevTools page
    port.onMessage.addListener(extensionListener);
});