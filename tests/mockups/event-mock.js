export class EventMock {
    constructor(target, options) {
        if (options != null) {
            const keys = Object.keys(options);
            for (let key of keys) {
                this[key] = options[key];
            }
        }

        this.target = target;

        this.actionsCalled = {
            preventDefault: false,
            cancelBubble: false,
            stopPropagation: false,
            stopImmediatePropagation: false
        }
    }

    preventDefault() {
        this.actionsCalled.preventDefault = true;
    }

    cancelBubble() {
        this.actionsCalled.cancelBubble = true;
    }

    stopPropagation() {
        this.actionsCalled.stopPropagation = true;
    }

    stopImmediatePropagation() {
        this.actionsCalled.stopImmediatePropagation = true;
    }
}