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
    add(fn) {
        fn && this._list.push(fn);
        !this.processing && this._processQueue();
    }

    /**
     * Loop through the required functions and execute them in turn.
     * @private
     */
    _processQueue() {
        this.processing = true;
        window.requestIdleCallback(deadline => {
            while((deadline.timeRemaining() > 0 || deadline.didTimeout) && this._list.length) {
                let fn = this._list.shift();
                fn();
            }
            this.processing = false;
        }, {timeout: 1000})
    }
}