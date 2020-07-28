/**
    This script runs in the background and get's its information from the content script.
    The content script pushes to this file when it detects crsbinding active on the page.
 */

const instances = {};

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    instances[request.url] = request.hasBinding;
    console.log(instances);
});