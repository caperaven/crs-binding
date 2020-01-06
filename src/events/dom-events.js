export function domEnableEvents(element) {
    element._domEvents = [];
    element.registerEvent = registerEvent;
    element.unregisterEvent = unregisterEvent;
}

export function domDisableEvents(element) {
    if (element._domEvents == null) return;
    for (let event of element._domEvents) {
        event.callback = null;
        event.event = null;
    }
    element._domEvents.length = 0;
    delete element._domEvents;
    delete element.registerEvent;
    delete element.unregisterEvent;
}

function registerEvent(event, callback) {
    this.addEventListener(event, callback);
    this._domEvents.push({
        event: event,
        callback: callback
    })
}

function unregisterEvent(event, callback) {
    const item = this._domEvents.find(item => item.event == event && item.callback == callback);
    if (item == null) return;

    this.removeEventListener(item.event, item.callback);

    this._domEvents.splice(this._domEvents.indexOf(item), 1);
    item.callback = null;
    item.event = null;
}
