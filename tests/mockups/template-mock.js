import {createMockChildren} from "./child-mock-factory.js";
import {mockElement} from "./element-mock.js";

export class TemplateMock {
    constructor(innerHTML) {
        mockElement(this);
        this.innerHTML = innerHTML;
        createMockChildren(this);
    }
}