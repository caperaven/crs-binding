export class EventEmitter {
    constructor() {
        this._events = new Map();
    }

    dispose() {
        this._events.clear();
    }

    async on(event, callback) {
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

    async emit(event, args) {
        if (this._events.has(event)) {
            const events = this._events.get(event);

            if (events.length == 1) {
                const result = await events[0](args);
                if (typeof args === "object" && result != null) {
                    args.result = result;
                }
            }
            else {
                for (let e of events) {
                    await e(args);
                }
            }
        }
    }

    async remove(event, callback) {
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

    async postMessage(query, args, scope) {
        const element = scope || document;
        const items = Array.from(element.querySelectorAll(query));
        const promises = [];

        for (let item of items) {
            promises.push(item.onMessage.call(item, args));
        }

        await Promise.all(promises);
    }
}