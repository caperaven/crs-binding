import {ElementMock, mockElement} from "./element-mock.js"

/**
 * This represents the document in js terms.
 */
class DocumentMock {
    static createElement(tag) {
        if (globalThis.__elementRegistry[tag] != null) {
            return mockElement(new globalThis.__elementRegistry[tag]());
        }
        return new ElementMock(tag);
    }

    createDocumentFragment() {
        return new ElementMock();
    }

    querySelector(query) {

    }
}


globalThis.document = DocumentMock
globalThis.document.body = new ElementMock("body");