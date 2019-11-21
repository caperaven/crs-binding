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
        if (requestIdleCallback == null) return this._runNextFunction();

        this.processing = true;
        requestIdleCallback(deadline => {
            while((deadline.timeRemaining() > 0 || deadline.didTimeout) && this._list.length) {
                this._runNextFunction();
            }
            this.processing = false;
        }, {timeout: 1000})
    }

    /**
     * Shift the list and run the function
     * @private
     */
    _runNextFunction() {
        let fn = this._list.shift();
        fn && fn();
    }
}