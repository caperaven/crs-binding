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

window.addEventListener("message", event => {
    if (event.source !== window) {
        return;
    }

    const message = event.data;

    // send message to background.js
    chrome.runtime.sendMessage(message);
});