/**
    This script runs in the background and get's its information from the content script.
    The content script pushes to this file when it detects crsbinding active on the page.
 */

window.instances = {};

window.get = function(args) {
    const key = args.key;
    const callback = args.callback;

    callback("hello world");
};

// message from the injected script
chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    window.instances[request.url] = request.hasBinding;
});