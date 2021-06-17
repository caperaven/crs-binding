import {DocumentMock} from "./dom-mock.js";

export async function load() {
    globalThis.HTMLElement = (await import("./element.mock.js")).ElementMock;
    globalThis.customElements = {
        define: () => {return null}
    }
    globalThis.document = new DocumentMock();
    await import("../src/index.js");
}

