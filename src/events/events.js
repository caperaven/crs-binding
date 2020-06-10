export class EventEmitter {
    constructor() {
        this._events = new Map();
    }

    dispose() {
        this._events.clear();
    }

    on(event, callback) {
        let events = [];

        if (this._events.has(event)) {
            events = this._events.get(event);
        } else {
            this._events.set(event, events);
        }

        if (events.indexOf(callback) == -1) {
            events.push(callback);
        }
    }

    emit(event, args) {
        if (this._events.has(event)) {
            const events = this._events.get(event);
            events.forEach(e => e(args));
        }
    }

    remove(event, callback) {
        if (this._events.has(event)) {
            const events = this._events.get(event);
            const index = events.indexOf(callback);
            if (index != -1) {
                events.splice(index, 1);
            }
            if (events.length === 0) {
                this._events.delete(event)
            } 
        }
    }

    postMessage(query, args, scope) {
        const element = scope || document;
        const items = Array.from(element.querySelectorAll(query));

        items.forEach(item => {
            if (item.onMessage != undefined) {
                item.onMessage.call(item, args);
            }
        });
    }
}