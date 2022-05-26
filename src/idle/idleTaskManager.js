import "./idleCallback.js";

export class IdleTaskManager {
    constructor() {
        this.processing = false;
        this._list = [];
    }

    dispose() {
        this._list = null;
    }

    /**
     * Add a function to the manager to call once the system is idle
     * @param fn {Function}
     */
    async add(fn) {
        if (typeof fn != "function") return;

        // no support, just call the function
        if (requestIdleCallback == null) return await fn();

        // add callback to list for processing
        this._list.push(fn);
        // if it is busy processing, don't do anything as the queue is already being processed.
        if (this.processing == true) return;

        // start processing
        await this._processQueue();
    }

    async _processQueue() {
        this.processing = true;
        try {
            requestIdleCallback(async () => {
                while(this._list.length > 0) {
                    const fn = this._list.shift();

                    try {
                        await fn();
                    }
                    catch(e) {
                        console.error(e);
                    }
                }
            }, {timeout: 1000})
        }
        finally {
            this.processing = false;
        }
    }
}