/**
 * This file is initialized by the manifest and injects the content script.
 */

function injectScript(file_path, tag) {
    const node = document.getElementsByTagName(tag)[0];
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    node.appendChild(script);
    return script;
}
const script = injectScript(chrome.extension.getURL('js/content.js'), 'body');

const port = chrome.runtime.connect({name: "crs-binding-inject"});

port.onMessage.addListener(msg => {
    console.log(msg);
    debugger;
});

// Messages from content.js
window.addEventListener("message", event => {
    if (event.source !== window) {
        return;
    }

    const message = event.data;

    // send message to background
    port.postMessage({
        source: "crs-binding-inject",
        key: "has-binding",
        msg: message
    });
});