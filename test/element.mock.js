export class ElementMock {
    constructor() {
        this.nodeName = "div";
        this.innerText = "";
        this.innerHTML = "";
        this.children = [];
        this.attributes = [];
        this.value = "";

        this.addEventListenerSpy = jest.spyOn(this, "addEventListener");
        this.removeEventListenerSpy = jest.spyOn(this, "removeEventListener");
        this.appendChildSpy = jest.spyOn(this, "appendChild");
    }

    addEventListener() {
    }

    removeEventListener() {
    }

    appendChild() {
    }
}