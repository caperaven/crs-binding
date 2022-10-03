export function getHtmlPath(obj) {
    const mobiPath = obj.mobi;
    if (mobiPath != null && /Mobi/.test(navigator.userAgent)) {
        return mobiPath;
    }

    return obj.html;
}