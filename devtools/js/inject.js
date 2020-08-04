function injectScript(file_path, tag) {
    const element = document.getElementsByTagName(tag)[0];
    const script = document.createElement('script');
    script.setAttribute('type', 'text/javascript');
    script.setAttribute('src', file_path);
    element.appendChild(script);
    script.onload = () => {
        element.removeChild(script);
    }
}

const port = chrome.runtime.connect({name: "crs-binding-inject"});

port.onMessage.addListener(msg => {
    if (msg.key == "refresh") {
        injectScript(chrome.extension.getURL('js/refresh.js'), 'body');
    }
});

// Messages from content.js
window.addEventListener("message", event => {
    if (event.source !== window) {
        return;
    }

    port.postMessage({
        source: "crs-binding-inject",
        msg: event.data
    });
});