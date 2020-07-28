/**
 * This script is inject into the page by inject.js so that it can access window level objects.
 * We need this to access the instance of the crs-binding.
 */

window.postMessage({
    url: window.location.href,
    hasBinding: window.crsbinding != null
}, "*");

