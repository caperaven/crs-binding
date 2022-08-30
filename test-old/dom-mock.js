import {ElementMock} from "./element.mock.js";

export class DocumentMock {
    createElement(tag) {
        return new ElementMock(tag);
    }

    createDocumentFragment() {
        return new ElementMock();
    }
}