import {EventEmitter} from "./../../src/events/event-emitter.js";

let log;

test("EventEmitter - emit", async () => {
    log = null;
    const fn = (args) => log = args;
    const instance = new EventEmitter();
    await instance.on("test", fn);
    await instance.emit("test", "Hello World");
    expect(log).toBe("Hello World");
    await instance.remove("test", fn)
})

test("EventEmitter - postMessage", async () => {
    const item = {
        async onMessage(args) {
            log = args;
        }
    }
    const scope = {
        querySelectorAll() {
            return [item]
        }
    }

    const instance = new EventEmitter();
    await instance.postMessage("", "Hello World", scope);
    expect(log).toEqual("Hello World");
})